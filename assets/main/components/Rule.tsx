import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import Choices from "choices.js";
import { ComponentChild } from "preact";
import { isNumeric } from "../helpers/TypeHelper";

export interface IRule {
    name: string;
    help?: string;
    value: any;
}

interface RulesProps {
    rules: IRule[];
    onSubmit: (rules: IRule[]) => void;
}

export function Rules({ rules, onSubmit }: RulesProps) {
    const [modified, setModified] = useState<IRule[]>([]);

    const handleChange = useCallback(
        function (name: string, value: any) {
            setModified((modified) => {
                const actual = modified.find((rule) => rule.name === name);
                if (actual) {
                    if (actual.value === value) {
                        return modified.filter((rule) => rule !== actual);
                    }
                    actual.value = value;
                } else {
                    return [...modified, { name, value }];
                }
                return modified;
            });
        },
        [setModified]
    );
    const handleSubmit = useCallback(
        function (event: Event) {
            event.preventDefault();
            onSubmit(modified);
            setModified([]);
        },
        [onSubmit, modified]
    );

    return (
        <div className="rules">
            {rules.map((rule) => {
                let Rule: ComponentChild;
                if (
                    rule.name === "AllowedBlocks" ||
                    rule.name === "DisabledPotions"
                ) {
                    Rule = <ChoiceRule value={rule.value} />;
                } else if (rule.name === "ChargedCreepers") {
                    Rule = <ChargedCreepersRule value={rule.value} />;
                } else {
                    if (
                        rule.name === "PlaceBlockInCave" &&
                        typeof rule.value === "object"
                    ) {
                        rule.value = rule.value.active;
                    }
                    Rule = (
                        <InputRule
                            name={rule.name}
                            value={rule.value}
                            onChange={handleChange}
                        />
                    );
                }
                return (
                    <div>
                        <label data-info={rule.help} for={rule.name}>
                            {rule.name}
                        </label>{" "}
                        : {Rule}
                    </div>
                );
            })}
            {modified.length !== 0 && (
                <button onClick={handleSubmit} class="save-btn">
                    Enregistrer
                </button>
            )}
        </div>
    );
}

interface InputRuleProps {
    name: string;
    value: boolean | number | string;
    onChange: (name: string, value: boolean | number | string) => void;
}

function InputRule({ name, value, onChange }: InputRuleProps) {
    const ref = useRef<HTMLInputElement>();
    const handleChange = useCallback(
        function () {
            const val =
                ref.current.type === "checkbox"
                    ? ref.current.checked
                    : ref.current.value;
            // @ts-expect-error
            onChange(name, isNumeric(val) ? parseInt(val, 10) : val);
        },
        [name, onChange]
    );
    useEffect(
        function () {
            if (ref.current.type === "checkbox") {
                ref.current.checked = value === "true";
            } else {
                ref.current.value = value as string;
            }
        },
        [ref, value]
    );

    if (typeof value === "boolean" || value === "true" || value === "false") {
        const checked = typeof value === "boolean" ? value : value === 'true';
        return (
            <input
                id={name}
                type="checkbox"
                onChange={handleChange}
                // @ts-expect-error
                defaultChecked={checked}
                ref={ref}
            />
        );
    }
    return (
        <input
            id={name}
            type={isNaN(value as number) ? "text" : "number"}
            onChange={handleChange}
            ref={ref}
        />
    );
}

interface ChargedCreepersRuleProps {
    value: {
        spawn: number;
        drop: number;
        tntAmount: number;
    };
}

function ChargedCreepersRule({ value }: ChargedCreepersRuleProps) {
    return (
        <>
            {Object.values(value).map((n) => (
                <input type="number" value={n} min="0" max="100" />
            ))}
        </>
    );
}

interface ChoiceRuleProps {
    value: any;
}

function ChoiceRule({ value }: ChoiceRuleProps) {
    const ref = useRef<HTMLSelectElement>();

    useEffect(function () {
        const choices = new Choices(ref.current, {
            //choices: Object.values(MinecraftData('1.16.5').blocks).filter(b => b.boundingBox !== 'empty').map(b => {return {label: b.displayName, value: b.name}}),
            removeItems: true,
            removeItemButton: true,
            duplicateItemsAllowed: false,
        });
        return choices.destroy;
    }, []);
    return (
        <>
            <select ref={ref}>{value}</select>
        </>
    );
}
