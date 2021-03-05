import { render, fireEvent } from "@testing-library/preact";
import { IRule, Rules } from "../../main/components/Rule";

describe("<Rules>", function () {
    it("should be a checkbox", async () => {
        const submit = jest.fn();
        const rules: IRule[] = [{ name: "TestingCheckbox", value: true }];
        const list = render(<Rules rules={rules} onSubmit={submit} />);
        const input = (await list.findByLabelText(
            "TestingCheckbox"
        )) as HTMLInputElement;
        expect(input).toHaveAttribute("type", "checkbox");
        expect(input).toHaveAttribute("checked");
        fireEvent.change(input, { target: { checked: false } });

        const save = await list.findByText("Enregistrer");
        expect(save).toBeInTheDocument();
        fireEvent.click(save);
        expect(submit).toHaveBeenLastCalledWith([
            { name: "TestingCheckbox", value: false },
        ]);
    });

    it("should be a number input", async () => {
        const submit = jest.fn();
        const rules: IRule[] = [{ name: "TestingInput", value: 4 }];
        const list = render(<Rules rules={rules} onSubmit={submit} />);
        const input = (await list.findByLabelText(
            "TestingInput"
        )) as HTMLInputElement;
        expect(input).toHaveAttribute("type", "number");
        expect(input).toHaveValue(4);
        fireEvent.change(input, { target: { value: "9" } });

        const save = await list.findByText("Enregistrer");
        expect(save).toBeInTheDocument();
        fireEvent.click(save);
        expect(submit).toHaveBeenLastCalledWith([
            { name: "TestingInput", value: 9 },
        ]);
    });
});
