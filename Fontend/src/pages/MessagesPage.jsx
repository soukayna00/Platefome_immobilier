import {useState} from 'react'
export default function MessagesPage(){
    const [draft,setDraft]=useState('');
    return <main className="mx-auto min-h-[70vh] max-w-[1280px] px-5 py-12 lg:px-9">
        <h1 className="text-4xl tracking-tight">Messagerie</h1>
        <p className="mb-7 mt-2 text-atba-muted">Les échanges sont organisés par annonce.</p>
        <div className="grid min-h-[460px] overflow-hidden rounded-xl border border-[#e8e3dc] bg-white md:grid-cols-[280px_1fr]">
            <aside className="border-b border-[#e8e3dc] p-5 md:border-b-0 md:border-r">
            <strong>Conversations</strong>
            <div className="mt-5 flex items-center gap-3 rounded-lg bg-atba-cream p-2">
            <img src="/images/riad.webp" alt="Riad" className="h-14 w-16 rounded object-cover"/>
            <span className="text-xs">Riad à Fès<br/><small className="text-atba-muted">Démonstration</small>
            </span></div></aside><div className="flex flex-col p-5"><strong>Riad rénové au cœur de la médina</strong>
            <p className="text-xs text-atba-muted">Exemple fictif, aucun message n’est envoyé.</p><div className="mt-7 w-fit max-w-[75%] rounded-xl bg-atba-cream p-3 text-sm">Bonjour, le bien est-il toujours disponible ?</div>
            <div className="ml-auto mt-3 w-fit max-w-[75%] rounded-xl bg-[#f5e7df] p-3 text-sm">Bonjour, oui. Vous souhaitez organiser une visite ?</div>
            <form onSubmit={e=>{e.preventDefault();alert('Messagerie à connecter à Laravel.');setDraft('')}} className="mt-auto flex gap-2 pt-8">
                <input aria-label="Votre message" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Écrire un message…" className="min-w-0 flex-1 rounded-lg border border-[#e8e3dc] p-3" required/>
                <button className="rounded-lg bg-atba-clay px-5 text-white">Envoyer</button>
                </form>
                </div>
                </div>
                </main>
                }
