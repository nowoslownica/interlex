'use client';
import React, {useCallback, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import "./main-page.css";

interface ProtoWord {
    id: number;
    lemma: string;
    body: string;
    source_url: string;
}

const WordCard = ({onClickCard, item}: { onClickCard: (item: ProtoWord) => () => void; item: ProtoWord }) => {
    const displayLemma = `*${item.lemma}`;
    const preview = item.body
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200);

    return (
        <li className="card" onClick={onClickCard(item)}>
            <div className="card-title">{displayLemma}</div>
            <div className="card-desc">{preview}{item.body.length > 200 ? '…' : ''}</div>
        </li>
    );
};

export default function Home({currentScript}: { currentScript: string; isGuest?: boolean }) {
    const [searchValue, setSearchValue] = useState("");
    const [items, setItems] = useState<ProtoWord[]>([]);
    const [hasFetched, setHasFetched] = useState(false);

    const onKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            fetch(`/api/proto?search=${encodeURIComponent(searchValue)}&limit=50&offset=0`)
                .then(res => res.json())
                .then((data) => {
                    setItems(data.items);
                    setHasFetched(true);
                });
        }
    }, [searchValue]);

    const navigate = useRouter();
    const onClickCard = useCallback((item: ProtoWord) => () => {
        navigate.push(`/proto/${item.id}`);
    }, []);

    const onChangeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }, []);

    return (
        <>
            <div className="search-container">
                <h1 className="text-xl font-bold text-slate-800 mb-4">Праславянский словарь (ESSJa)</h1>
                <input
                    type="text"
                    className="search-box"
                    placeholder="Поиск по лемме…"
                    value={searchValue}
                    onKeyDown={onKeyDown}
                    onChange={onChangeSearch}
                />
            </div>
            <div className="scroll-container">
                {items.length > 0 && (
                    <ul id="cardGrid" className="card-grid">
                        {items.map((item) => (
                            <WordCard key={item.id} onClickCard={onClickCard} item={item} />
                        ))}
                    </ul>
                )}
                {hasFetched && !items.length && (
                    <div id="noResults" className="no-results">Ничего не найдено</div>
                )}
            </div>
        </>
    );
}