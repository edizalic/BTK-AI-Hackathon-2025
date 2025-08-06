import { Button } from "@/components/ui/button"

export default function ButtonDemo() {
    return (
        <div className="container mx-auto p-8 space-y-8">
            <h1 className="text-4xl font-bold">shadcn/ui Button Component Test</h1>
            
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Button Variants</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Button Sizes</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">🎯</Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Disabled State</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <Button disabled>Disabled Default</Button>
                    <Button variant="outline" disabled>Disabled Outline</Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Dark Mode Test</h2>
                <p className="text-muted-foreground">
                    Toggle your browser's dark mode to test theme switching.
                </p>
            </div>
        </div>
    )
}
