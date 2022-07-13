import { For, createSignal, createEffect } from 'solid-js';
// import { MultiSelect } from '@digichanges/solid-multiselect';

const boards = [
    ['NTSC', 1078039113],
    ['NTSC19', 907672507],
    ['NTSC29', 388848410],
    ['NTSC29 Lines', 1955350822],
    ['NTSC Level', 2046616260],
];

const platformIndex = 3;
const playstyleIndex = 4;
const proofIndex = 5;

function getUnique(table, index) {
    return table.rows
        .map((row) => row[index])
        .filter((d, i, a) => a.indexOf(d) === i);
}

function MultiSelect(props) {
    function handler(option) {
        if (props.selected.includes(option)) {
            props.onSelect(props.selected.filter(opt => opt !== option));
        } else {
            props.onSelect(props.selected.concat([option]));
        }
    }
    return (
        <div>
            <For each={props.options}>
                {(option) => (
                    <>
                        <label for={option}>{option}</label>
                        <input type="checkbox" id={option} checked={props.selected.includes(option)} onChange={[handler, option]}/>
                    </>
                )}
            </For>
        </div>
    );
}

function App() {
    const [table, setTable] = createSignal([], { equals: false });
    const [boardID, setBoardID] = createSignal(boards[0][1]);

    const [playstyles, setPlaystyles] = createSignal([]);
    const [platforms, setPlatforms] = createSignal([]);
    const [proofs, setProofs] = createSignal([]);

    const [playstyleFilter, setPlaystyleFilter] = createSignal([]);
    const [platformFilter, setPlatformFilter] = createSignal([]);
    const [proofFilter, setProofFilter] = createSignal([]);

    createEffect(() => {
        const sheetId = '1ZBxkZEsfwDsUpyire4Xb16er36Covk7nhR8BN_LPodI';
        const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
        const sheetName = 'user-data';
        const query = encodeURIComponent('Select *');
        const url = `${base}&sheet=${sheetName}&tq=${query}&gid=${boardID()}`;

        fetch(url)
            .then((res) => res.text())
            .then((rep) => {
                const { table } = JSON.parse(rep.slice(47, -2));
                table.rows = table.rows.map((row) =>
                    row.c.map((col) => col?.v),
                );
                setTable(table);
                const playstyles = getUnique(table, playstyleIndex);
                setPlaystyles(playstyles);
                setPlaystyleFilter(playstyleFilter().filter(item => playstyles.includes(item)));
                const platforms = getUnique(table, platformIndex);
                setPlatforms(platforms);
                setPlatformFilter(platformFilter().filter(item => platforms.includes(item)));
                const proofs = getUnique(table, proofIndex);
                setProofs(proofs);
                setProofFilter(proofFilter().filter(item => proofs.includes(item)));
            })
            .catch(console.error);
    });

    return (
        <div>
            <select onChange={(e) => setBoardID(e.target.value)}>
                <For each={boards}>
                    {([name, key]) => <option value={key}>{name}</option>}
                </For>
            </select>
            <MultiSelect
                options={playstyles()}
                onSelect={(items) => setPlaystyleFilter(items)}
                selected={playstyleFilter()}
            />
            <MultiSelect
                options={platforms()}
                onSelect={(items) => setPlatformFilter(items)}
                selected={platformFilter()}
            />
            <MultiSelect
                options={proofs()}
                onSelect={(items) => setProofFilter(items)}
                selected={proofFilter()}
            />
            <table>
                <thead>
                    <tr>
                        <For each={table().cols?.slice(0, -1)}>
                            {(head) => <th>{head.label}</th>}
                        </For>
                    </tr>
                </thead>
                <tbody>
                    <For
                        each={table().rows?.filter(
                            (row) =>
                                (!playstyleFilter().length ||
                                    playstyleFilter().includes(
                                        row[playstyleIndex],
                                    )) &&
                                (!platformFilter().length ||
                                    platformFilter().includes(
                                        row[platformIndex],
                                    )) &&
                                (!proofFilter().length ||
                                    proofFilter().includes(row[proofIndex])),
                        )}
                    >
                        {(row, indexRow) => (
                            <tr>
                                <For each={row.slice(0, -1)}>
                                    {(col, indexCol) => <td>{indexCol() === 0 ? indexRow() + 1 : col}</td>}
                                </For>
                            </tr>
                        )}
                    </For>
                    <tr>
                        <td>1</td>
                    </tr>
                </tbody>
            </table>

            {/*<pre>{JSON.stringify(table(), 0, 4)}</pre>*/}
        </div>
    );
}

export default App;
