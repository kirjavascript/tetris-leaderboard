import styles from './App.module.css';
import { For, createSignal, createEffect } from 'solid-js';

const boards = [
    ['NTSC', 1078039113],
    ['NTSC19', 907672507],
    ['NTSC29', 388848410],
    ['NTSC29 Lines', 1955350822],
    ['NTSC Level', 2046616260],
];

function App() {
    const [table, setTable] = createSignal([]);
    const [boardID, setBoardID] = createSignal(boards[0][1]);

    createEffect(() => {
        const sheetId = '1ZBxkZEsfwDsUpyire4Xb16er36Covk7nhR8BN_LPodI';
        const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
        const sheetName = 'user-data';
        const query = encodeURIComponent('Select *');
        const url = `${base}&sheet=${sheetName}&tq=${query}&gid=${boardID()}`;

        fetch(url)
            .then((res) => res.text())
            .then((rep) => {
                setTable(JSON.parse(rep.slice(47, -2)).table);
            })
            .catch(console.error);
    });

    return (
        <div>
            <select onChange={e => setBoardID(e.target.value)}>
                <For each={boards}>
                    {([name, key]) => <option value={key}>{name}</option>}
                </For>
            </select>
            <table>
                <thead>
                    <tr>
                        <For each={table().cols}>
                            {(head) => <th>{head.label}</th>}
                        </For>
                    </tr>
                </thead>
                <tbody>
                    <For each={table().rows}>
                        {(row) => <tr>

                    <For each={row.c}>
                        {(col) => <td>
                            {col?.v}

                        </td>}
                    </For>

                        </tr>}
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
