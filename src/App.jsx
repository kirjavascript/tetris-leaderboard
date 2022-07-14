import { For, createSignal, createEffect } from 'solid-js';

const boards = [
    ['NTSC', 1078039113],
    ['NTSC19', 907672507],
    ['NTSC29', 388848410],
    ['NTSC29 Lines', 1955350822],
    ['NTSC Level', 2046616260],
    ['PAL', 1899465071],
    ['PAL19', 1148941034],
];

const platformIndex = 3;
const playstyleIndex = 4;
const proofIndex = 5;

function MultiSelect(props) {
    function handler(option) {
        if (props.selected.includes(option)) {
            props.onSelect(props.selected.filter((opt) => opt !== option));
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
                        <input
                            type="checkbox"
                            id={option}
                            checked={props.selected.includes(option)}
                            onChange={[handler, option]}
                        />
                    </>
                )}
            </For>
        </div>
    );
}

function App() {
    const [table, setTable] = createSignal([], { equals: false });
    const [playstyles, setPlaystyles] = createSignal([]);
    const [platforms, setPlatforms] = createSignal([]);
    const [proofs, setProofs] = createSignal([]);

    const query = new URLSearchParams(window.location.search);
    const params = [...query.entries()].reduce((acc, [type, value]) => {
        acc[type] = value.split('|');
        return acc;
    }, {});

    const [board, setBoard] = createSignal(
        (params.board &&
            boards.find(([name]) => name === params.board.join(''))) ||
            boards[0],
    );
    const [playstyleFilter, setPlaystyleFilter] = createSignal(
        params.playstyle || [],
    );
    const [platformFilter, setPlatformFilter] = createSignal(
        params.platform || ['Console'],
    );
    const [proofFilter, setProofFilter] = createSignal(
        params.proof || ['Video'],
    );

    function normal(str) {
        return str.replace(/Video\+/i, 'Video');
    }

    function getUnique(table, index) {
        return table.rows
            .map((row) => normal(row[index]))
            .filter((d, i, a) => a.indexOf(d) === i);
    }

    createEffect(() => {
        const sheetId = '1ZBxkZEsfwDsUpyire4Xb16er36Covk7nhR8BN_LPodI';
        const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
        const sheetName = 'user-data';
        const query = encodeURIComponent('Select *');
        const url = `${base}&sheet=${sheetName}&tq=${query}&gid=${board()[1]}`;

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
                setPlaystyleFilter(
                    playstyleFilter().filter((item) =>
                        playstyles.includes(item),
                    ),
                );
                const platforms = getUnique(table, platformIndex);
                setPlatforms(platforms);
                setPlatformFilter(
                    platformFilter().filter((item) => platforms.includes(item)),
                );
                const proofs = getUnique(table, proofIndex);
                setProofs(proofs);
                setProofFilter(
                    proofFilter().filter((item) => proofs.includes(item)),
                );
            })
            .catch(console.error);
    });

    createEffect(() => {
        const query = [
            ['board', [board()[0]]],
            ['proof', proofFilter()],
            ['platform', platformFilter()],
            ['playstyle', playstyleFilter()],
        ]
            // .filter(([, group]) => group && group.length)
            .map(
                ([name, group]) =>
                    `${name}=${group.map(encodeURIComponent).join('|')}`,
            )
            .join('&');
        window.history.replaceState(null, '', '?' + query);
    });

    return (
        <div>
            <a href="https://docs.google.com/spreadsheets/d/1ZBxkZEsfwDsUpyire4Xb16er36Covk7nhR8BN_LPodI/edit">
                data source
            </a>
            <select onChange={(e) => setBoard(boards[e.target.selectedIndex])}>
                <For each={boards}>
                    {([name, key]) => (
                        <option value={key} selected={key === board()[1]}>
                            {name}
                        </option>
                    )}
                </For>
            </select>
            <MultiSelect
                options={proofs()}
                onSelect={(items) => setProofFilter(items)}
                selected={proofFilter()}
            />
            <MultiSelect
                options={platforms()}
                onSelect={(items) => setPlatformFilter(items)}
                selected={platformFilter()}
            />
            <MultiSelect
                options={playstyles()}
                onSelect={(items) => setPlaystyleFilter(items)}
                selected={playstyleFilter()}
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
                                        normal(row[playstyleIndex]),
                                    )) &&
                                (!platformFilter().length ||
                                    platformFilter().includes(
                                        normal(row[platformIndex]),
                                    )) &&
                                (!proofFilter().length ||
                                    proofFilter().includes(
                                        normal(row[proofIndex]),
                                    )),
                        )}
                    >
                        {(row, indexRow) => (
                            <tr>
                                <For each={row.slice(0, -1)}>
                                    {(col, indexCol) => (
                                        <td>
                                            {indexCol() === 0
                                                ? indexRow() + 1
                                                : col}
                                        </td>
                                    )}
                                </For>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>

            {/*<pre>{JSON.stringify(table(), 0, 4)}</pre>*/}
        </div>
    );
}

export default App;
