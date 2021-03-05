import { DataBridge } from "../DataBridge";

interface LoginFormProps {
    onConnect: (bridge: DataBridge) => any;
}

export function LoginForm({ onConnect }: LoginFormProps) {
    const handleSubmit = function (event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        if (!form.checkValidity()) {
            return false;
        }

        const data = new FormData(form);
        const { address, port, password } = Object.fromEntries(data);
        const socket = new WebSocket(`ws://${address}:${port}/socket`);
        new DataBridge(socket, password as string, onConnect, console.error);
        return false;
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>FkBoard</h1>
            <div class="input-group">
                <div class="input">
                    <label for="address">Adresse</label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        placeholder="localhost"
                        value="localhost"
                    />
                </div>
                <div class="input">
                    <label for="port">Port</label>
                    <input
                        type="number"
                        name="port"
                        id="port"
                        placeholder="50000"
                        value="50000"
                    />
                </div>
            </div>
            <div class="input">
                <label for="password">Mot de passe</label>
                <input type="password" name="password" id="password" />
            </div>
            <input type="submit" value="Connexion" />
        </form>
    );
}
