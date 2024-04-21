import { Footer, Navbar } from "@/components";

export default function Body({ children }) {
    return (
        <body className="md:flex reddit-mono bg-slate-700">
            <Navbar />
            <main className="flex-grow px-[1.25rem] md:px-9 py-6 md:py-8">
                {children}
                <Footer />
            </main>
        </body>
    );
}