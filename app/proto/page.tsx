import React, { Suspense } from "react";
import Home from "@/app/proto/Home";
import {auth} from "@/auth";
import {getUserScript} from "@/lib/get-user-script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Праславянский словарь",
  description: "Поиск по праславянскому словарю (ESSJa — Этимологический словарь славянских языков под редакцией О. Н. Трубачёва). Леммы, реконструкции и исторические контексты.",
};

export default async function ProtoPage() {
    const session = await auth();
    const currentScript = await getUserScript();

    return (
        <main className="main-content">
            <Suspense fallback={<div className="search-container"><input type="text" className="search-box" placeholder="Поиск по лемме…" disabled /></div>}>
                <Home currentScript={currentScript} isGuest={!session} />
            </Suspense>
        </main>
    );
}