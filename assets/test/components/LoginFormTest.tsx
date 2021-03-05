import { render } from "@testing-library/preact";
import { LoginForm } from "../../main/components/LoginForm";

describe("<LoginForm />", function () {
    test("should be a form", async () => {
        const form = render(<LoginForm onConnect={console.debug} />);

        const address = await form.findByLabelText("Adresse");
        expect(address).toHaveAttribute("type", "text");
        const port = await form.findByLabelText("Port");
        expect(port).toBeInTheDocument();
        const password = await form.findByLabelText("Mot de passe");
        expect(password).toHaveAttribute("type", "password");
    });
});
