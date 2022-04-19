import { shallowMount, createLocalVue } from "@vue/test-utils";
import QuikConsole from "@/components/QuikConsole.vue";

describe("QuikConsole", () => {

    // Mount QuikConsole
    const wrapper = shallowMount(QuikConsole);

    /**
     * Writes 'return "Hello World!";' to console and executes it
     *
     * @type {VueConstructor<Vue>}
     */
    test('Write `return "Hello World!";` to the console and execute.', async () => {

        // Test - Not needed, left as POC
        expect(wrapper.vm.SourceCode).toBe('');
        expect(wrapper.vm.CodeHistory).toStrictEqual([]);
        expect(wrapper.vm.ScriptEvaluation).toStrictEqual([]);

        // Write 'return "Hello World!"' to the console (textarea)
        const textarea = wrapper.find("#_qwik-console-textarea")
        textarea.setValue('return "Hello World!";')
        await wrapper.vm.$nextTick(); // is required to take effect.

        expect(wrapper.vm.SourceCode).toBe('return "Hello World!";');
        expect(textarea.element.value).toBe('return "Hello World!";');

        // Clicks the [>_] button
        wrapper.find(".quik-console-button.quik-console-button-run").trigger("click");
        await wrapper.vm.$nextTick();

        // SourceCode (the textarea) should not have changed.
        expect(wrapper.vm.SourceCode).toBe('return "Hello World!";');

        // CodeHistory should be updated
        expect(wrapper.vm.CodeHistory).toStrictEqual(['return "Hello World!";']);

        // ScriptEvaluation should be an array containing exactly 1 string
        expect(wrapper.vm.ScriptEvaluation).toStrictEqual(["Hello World!"]);

        // Test the log (the box containing script evaluation)
        const box = wrapper.find(".quik-log-entry");
        expect(box.exists()).toBeTruthy();
        expect(box.text()).toContain("Hello World!");

    });

    /**
     * Test "Clear console" and mocked "console.log"
     */
    test("Clear the console, and test 'console.log'.", async () => {

        expect(wrapper.vm.SourceCode).toBe('return "Hello World!";');
        expect(wrapper.vm.CodeHistory).toStrictEqual(['return "Hello World!";']);
        expect(wrapper.vm.ScriptEvaluation).toStrictEqual(["Hello World!"]);

        // Click the "Clear console" button
        wrapper.find(".quik-console-button.quik-console-button-clear").trigger("click");
        await wrapper.vm.$nextTick();

        // Textarea should be empty
        expect(wrapper.vm.SourceCode).toBe("");
        const textarea = wrapper.find("#_qwik-console-textarea")
        await wrapper.vm.$nextTick();
        expect(textarea.text()).toBe("");

        // Write next line of code
        wrapper.find("#_qwik-console-textarea").setValue('console.log("QuikConsole rocks!");')
        await wrapper.vm.$nextTick();

        // Check textarea & prop
        expect(wrapper.vm.SourceCode).toBe('console.log("QuikConsole rocks!");');
        expect(textarea.element.value).toBe('console.log("QuikConsole rocks!");');

        // Clicks the [>_] button
        wrapper.find(".quik-console-button.quik-console-button-run").trigger("click");
        await wrapper.vm.$nextTick();

        // Test props
        expect(wrapper.vm.SourceCode).toBe('console.log("QuikConsole rocks!");');
        expect(wrapper.vm.CodeHistory).toStrictEqual(['return "Hello World!";','console.log("QuikConsole rocks!");']);
        expect(wrapper.vm.ScriptEvaluation).toStrictEqual(["Hello World!","QuikConsole rocks!"]);

        // Test the log (the box containing script evaluation)
        const children = await wrapper.findAll(".quik-log-entry");
        expect(children).toHaveLength(2);
        expect(children.at(0).text()).toContain("Hello World!");
        expect(children.at(1).text()).toContain("QuikConsole rocks!");
    });

    /**
     * Test history
     */
    test("Clear the console and test history.", async () => {

        expect(wrapper.vm.SourceCode).toBe('console.log("QuikConsole rocks!");');
        expect(wrapper.vm.CodeHistory).toStrictEqual(['return "Hello World!";','console.log("QuikConsole rocks!");']);
        expect(wrapper.vm.ScriptEvaluation).toStrictEqual(["Hello World!","QuikConsole rocks!"]);

        // Click the "Clear console" button
        wrapper.find(".quik-console-button.quik-console-button-clear").trigger("click");
        await wrapper.vm.$nextTick();

        // Textarea should be empty
        expect(wrapper.vm.SourceCode).toBe("");
        const textarea = wrapper.find("#_qwik-console-textarea")
        await wrapper.vm.$nextTick();
        expect(textarea.text()).toBe("");

        // Click arrow up
        wrapper.find(".quik-console-button.quik-console-button-previous").trigger("click");
        await wrapper.vm.$nextTick();

        // The textarea should contain the code that was last executed
        expect(wrapper.vm.SourceCode).toBe('console.log("QuikConsole rocks!");');
        expect(textarea.element.value).toBe('console.log("QuikConsole rocks!");');

        // Click arrow down
        wrapper.find(".quik-console-button.quik-console-button-next").trigger("click");
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.SourceCode).toBe('return "Hello World!";');
        expect(textarea.element.value).toBe('return "Hello World!";');
    });

    /**
     * Test without any code
     */
    test("Run the component as it is.", async () => {

        const localVue = createLocalVue()
        const freshWrapper = shallowMount(QuikConsole, {localVue});

        expect(freshWrapper.vm.SourceCode).toBe("")
        expect(freshWrapper.vm.CodeHistory).toStrictEqual([])
        expect(freshWrapper.vm.ScriptEvaluation).toStrictEqual([])

        // Clicks the [>_] button
        freshWrapper.find(".quik-console-button.quik-console-button-run").trigger("click");
        await freshWrapper.vm.$nextTick()

        // Props should be unchanged
        expect(freshWrapper.vm.SourceCode).toBe("");
        expect(freshWrapper.vm.CodeHistory).toStrictEqual([]);
        expect(freshWrapper.vm.ScriptEvaluation).toStrictEqual([]);

        // The log should contain no entry, thus be undefined
        const box = freshWrapper.find(".quik-log-entry");
        expect(box.exists()).toBeFalsy();
    });

});
