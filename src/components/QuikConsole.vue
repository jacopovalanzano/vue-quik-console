<template>
    <!-- Author: Jacopo Valanzano jacopo.valanzano.com -->
    <!-- https://github.com/jacopovalanzano/vue-quik-console -->
    <!-- License: MIT https://opensource.org/licenses/MIT -->
    <main>
        <div class="quik-wrapper">
            <!-- Log container -->
            <div class="quik-container">
                <div class="quik-console-container">
                    <div id="quikConsoleLog" ref="quikConsoleLog" class="quik-console-container-log">
                        <!-- Render each log message (the executed code evaluation) -->
                        <div v-bind:key="Evaluation" v-for="Evaluation in ScriptEvaluation" class="quik-log-entry-container">
                            <span class="quik-log-entry">{{ Evaluation }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Console container -->
            <div class="quik-container">
                <div class="quik-console-container">
                    <div class="quik-console-container-area">
                        <!-- The actual console text area, where the code is written -->
                        <textarea
                            v-model="SourceCode"
                            id="_qwik-console-textarea"
                            class="qwik-console-textarea" />
                    </div>
                    <div class="quik-console-container-launcher">
                        <!-- Executes the script on click -->
                        <button @click="runCode" class="quik-console-button quik-console-button-run">
                            &#10095;_&nbsp;
                        </button>
                        <div class="quik-console-launcher-box">
                            <!-- Retrieves previously executed command from the list. -->
                            <button @click="scrollUp" class="quik-console-button quik-console-button-previous">
                                &uarr;
                            </button>
                            <!-- Retrieves the next command in list. -->
                            <button @click="scrollDown" class="quik-console-button quik-console-button-next">
                                &darr;
                            </button>
                            <!-- Clears the console -->
                            <button @click="clearConsole()" class="quik-console-button quik-console-button-clear">
                                <small>Clear console</small>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
export default {
    name: 'QuikConsole',
    data() {
        return {
            // The source code to execute.
            SourceCode: '',
            // Contains the source code of each executed script.
            CodeHistory: new Array(),
            // Contains the result of each executed script.
            ScriptEvaluation: new Array()
        }
    },
    watch: {
        async CodeHistory() {

            await this.$nextTick()

            /**
             * If the scrolling bar of the evaluation log container is fixed to the bottom, the container
             * should scroll automatically, everytime code is executed.
             */
            let shouldScroll = false

            let scrollEl = this.$refs.quikConsoleLog

            // "scrollTopMax" is non-standard
            // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
            if (scrollEl.scrollTop >= scrollEl.scrollLeftMax - 5) {
                shouldScroll = true
            }

            // Scroll down if the scroll bar is fixed to the bottom!
            if (shouldScroll === true) {
                scrollEl.scrollTo(0, scrollEl.scrollHeight)
            }
        }
    },
    methods: {
        // Clears the console text area.
        clearConsole() {
            this.SourceCode = ''
        },

        // Scrolls to previous executed code.
        scrollUp() {
            if (this.CodeHistory.length <= 1) {
                return
            }

            this.CodeHistory.splice(0, 0, this.CodeHistory.pop())
            this.SourceCode = this.CodeHistory[0]
        },
        // Scrolls to next executed code.
        scrollDown() {
            if (this.CodeHistory.length <= 1) {
                return
            }

            this.CodeHistory.push(this.CodeHistory.splice(0, 1)[0])
            this.SourceCode = this.CodeHistory[0]
        },
        // Runs the JS source code.
        async runCode() {
            try {
                // Return if there is not code to execute
                if(this.SourceCode.length <= 0) {
                    return;
                }

                // Add the code being executed to the "history" list
                this.CodeHistory.push(this.SourceCode)

                // Execute code
                let result = Function(this.SourceCode)()

                /**
                 * Arguably, undefined results should be omitted from the log. For example:
                 *
                 * 'return "";' would log an empty result.
                 * 'return;' would not be logged.
                 */
                if(typeof result === "undefined") {
                    return;
                }

                // Log friendly message with operation result.
                console.info('%c' + result, 'color: blue;')

                // Push result to log list.
                this.ScriptEvaluation.push(result)

                // Wait for the view to be updated
                await this.$nextTick()

            } catch (e) {
                // Logs errors to console. Without, errors, like syntax errors, would not be logged!
                console.error(e)
            }
        }
    },
    beforeMount() {
        // Clone "this"
        let _this = this;

        /**
         * Replaces "console.log" to allow manipulate messages.
         */
        (function () {
            var oldLog = console.log
            console.log = function () {
                // Logs to browser console
                oldLog.apply(console, arguments)

                // Get the args passed to console.log and turn it into object
                let {...logArgs} = arguments

                // Push to log each "console.log" evaluation.
                for (let log in logArgs) {
                    _this.ScriptEvaluation.push(logArgs[log])
                }
            }
        })()
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/**
 * Author: Jacopo Valanzano jacopo.valanzano.com
 * License: MIT https://opensource.org/licenses/MIT
 */

/* Wrapper */
.quik-wrapper {
    display: flex;
    flex-wrap: wrap;
}

/* The widget container */
.quik-container {
    box-sizing: border-box;
    flex: 1;
    flex-wrap: wrap;
    margin: 5px;
    font-family: Helvetica;
}

/* The console container */
.quik-console-container {
    width: 100%;
    height: 250px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

/* The console textarea container */
.quik-console-container-area {
    display: block;
    width: 100%;
    height: 100%;
}

/* The launcher (bottom navigation) */
.quik-console-container-launcher {
    box-sizing: border-box;
    background-color: #44484f;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 1pt #44484f solid;
    border-top: 1pt #232231 solid;
    width: 100%;
    height: auto;
    padding: 5pt;
}

.quik-console-container-log {
    border: 1pt #ccc solid;
    border-radius: 3pt;
    padding: 2pt;
    width: 100%;
    height: 250px;
    flex-direction: column;
    overflow-y: auto;
    text-align: left;
    resize: both;
    overflow: auto;
}

.quik-log-entry-container {
    border-bottom: 1pt #ccc solid;
    height: 15pt;
    line-height: 1.8;
    white-space: nowrap;
}

.quik-log-entry {
    padding: 3pt;
}

.quik-console-launcher-box {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.qwik-console-textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 5pt;
    overflow-y: auto;
    resize: none;
    border: 1pt #44484f solid;
    border-top-left-radius: 3pt;
    border-top-right-radius: 3pt;
    color: #FFCC77;
    background: #30343B;
}

.quik-console-button {
    min-width: 1.5em;
    min-height: 1.5em;
    border: 1pt #25282d solid;
    border-radius: 3pt;
    margin: 1pt 3pt;
    padding: 3pt;
    display: flex;
    color: #fff;
    background: #25282d;
    justify-content: center;
    align-items: center;
}

.quik-console-button:hover {
    cursor: pointer;
}
</style>
