import { For, createSignal, createEffect } from 'solid-js';
import { MultiSelect } from '@digichanges/solid-multiselect';

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
                setPlaystyles(getUnique(table, playstyleIndex));
                setPlatforms(getUnique(table, platformIndex));
                setProofs(getUnique(table, proofIndex));
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
                style={{
                    chips: { color: 'white', 'background-color': 'steelblue' },
                }}
                options={playstyles()}
                onSelect={(items) => setPlaystyleFilter(items)}
                onRemove={(items) => setPlaystyleFilter(items)}
                showCheckbox={true}
                selectedValues={playstyleFilter()}
            />
            <MultiSelect
                style={{
                    chips: { color: 'white', 'background-color': 'steelblue' },
                }}
                options={platforms()}
                onSelect={(items) => setPlatformFilter(items)}
                onRemove={(items) => setPlatformFilter(items)}
                showCheckbox={true}
                selectedValues={platformFilter()}
            />
            <MultiSelect
                style={{
                    chips: { color: 'white', 'background-color': 'steelblue' },
                }}
                options={proofs()}
                onSelect={(items) => setProofFilter(items)}
                onRemove={(items) => setProofFilter(items)}
                showCheckbox={true}
                selectedValues={proofFilter()}
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
                        {(row) => (
                            <tr>
                                <For each={row.slice(0, -1)}>
                                    {(col) => <td>{col}</td>}
                                </For>
                            </tr>
                        )}
                    </For>
                    <tr>
                        <td>1</td>
                    </tr>
                </tbody>
            </table>

            <pre>{JSON.stringify(table(), 0, 4)}</pre>
        </div>
    );
}

export default App;
