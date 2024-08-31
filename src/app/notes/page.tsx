import BlurFade from "@/components/magicui/blur-fade";
import { NotesCard } from "@/components/notes-card"
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
    return (
        <main className="flex flex-col min-h-[100dvh] space-y-10">
            <section id="notes">
                <div className="space-y-12 w-full py-12 pt-2">
                    <BlurFade delay={BLUR_FADE_DELAY * 11}>
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                            Notes
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                            i like to learn
                        </h2>
                        <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            i study a lot, write notes, and share them with friends. here are some of my notes from school.
                        </p>
                        </div>
                    </div>
                    </BlurFade>
                    <BlurFade delay={BLUR_FADE_DELAY * 14}>
                    <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
                    {DATA.notes.map((note, id) => (
                        <BlurFade
                        key={note.title + note.dates}
                        delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                        >
                        <NotesCard
                            title={note.title}
                            description={note.description}
                            location={note.location}
                            dates={note.dates}
                            image={note.image}
                            links={note.links}
                        />
                        </BlurFade>
                    ))}
                    </ul>
                </BlurFade>
            </div>
        </section>
    </main>
    )
}