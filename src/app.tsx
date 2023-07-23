import {Button, Rows, Text, FormField, TextInput, Box, Column, Columns, LoadingIndicator} from "@canva/app-ui-kit";
import * as React from "react";
import styles from "styles/components.css";

type AppElementData = {
  searchedWord: string;
  currentWord: string;
  children: JSX.Element[];
  buttonDisabled: boolean;
};

// The state of the user interface. In this example, this is the same
// as AppElementData, but it *could* be different.
type UIState = AppElementData;

// The default values for the UI components.
const initialState: UIState = {
  searchedWord: "",
  currentWord: "",
  children: [],
  buttonDisabled: true,
};

const synonymStyle = {
    paddingTop: "5px",
    paddingBottom: "5px"
};

export const App = () => {
    const [state, setState] = React.useState<UIState>(initialState);
    let synonyms: Set<string> = new Set;

    // Search for the word in the text field
    async function onSearch(word: string) {
        // Clear results
        clearResults();
        setState(
            (prevState) => {
                return {...prevState, searchedWord: word, currentWord: "", buttonDisabled: true}
            });
        if (word != "") {
            setState(
            (prevState) => {
                    return {...prevState, children: [<LoadingIndicator size="large"/>]}
                }
            )
            await getSynonyms(word);
            displayResults(word);
        }
    }

    function clearResults() {
        setState(
            (prevState) => {
                return {...prevState, children: []}
            }
        )
    }

    async function getSynonyms(requestedWord: string) {
        if (requestedWord == "") {
            return;
        }
        const url ="https://api.api-ninjas.com/v1/thesaurus?word=" + requestedWord;
        const res = await fetch(url, {
                headers: {"X-Api-Key": "I3akh5xPsSV+Pv8pYgD+Sg==vw8lj0aChOeccNP1"},
                method: "GET",
            }
        );
        const result = await res.json();
        console.log(result);
        synonyms = new Set(result.synonyms.slice(0, 20));
    }

    function displayResults(searchedWord: string) {
        if (synonyms.size == 0) {
            // Could not get synonyms for word
            setState(
                (prevState) => {
                    return {...prevState, children: [<h3>Could not find synonyms for "{searchedWord}"</h3>]}
                }
            )
        } else {
            let children = getChildren();
            setState(
                (prevState) => {
                    return {...prevState, children: [<h3>Showing synonyms for "{searchedWord}"</h3>, ...children]}
                }
            )
        }
    }

    function getChildren(): JSX.Element[] {
        let syns = Array.from(synonyms);
        let children: JSX.Element[] = [];
        let i = 0;
        while (i < syns.length && i < 20) {
            let firstWord = syns[i];
            let secondWord = syns[i+1];
            children.push(
                <Columns spacing="2u" key={syns[i]}>
                    <Column>
                        <div style={synonymStyle} onClick={() => onSearch(firstWord)}>
                            <Button
                                variant="secondary"
                                key={firstWord}
                                stretch
                            >
                                {firstWord}
                            </Button>
                        </div>
                    </Column>
                    <Column>
                        <div style={synonymStyle} onClick={() => onSearch(secondWord)}>
                            <Button
                                variant="secondary"
                                key={firstWord}
                                stretch
                            >
                                {secondWord}
                            </Button>
                        </div>
                    </Column>
                </Columns>
            )
            i = i + 2;
        }
        return children;
    }

    function onChange(value) {
        if (value != "") {
            setState(
                (prevState) => {
                    return {...prevState, buttonDisabled: false}
                }
            )
        } else {
            setState(
                (prevState) => {
                    return {...prevState, buttonDisabled: true}
                }
            )
        }
        setState((prevState) => {
                return {
                    ...prevState,
                    currentWord: value,
                };
            }
        )
    }

    return (
        <div className={styles.scrollContainer}>
            <Rows spacing="2u">
                <h3>Search for synonyms!</h3>
                <FormField
                    label=""
                    control={() => (
                        <TextInput
                            placeholder="Type a word..."
                            value={state.currentWord}
                            onChange={(value) => onChange(value)}
                        />
                    )}
                />
                <Button
                variant="primary"
                onClick={() => onSearch(state.currentWord)}
                disabled={state.buttonDisabled}
                stretch
                >search</Button>
                <div id="results">{state.children}</div>
            </Rows>
        </div>
    );
};
