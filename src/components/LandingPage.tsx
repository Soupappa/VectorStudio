import { Sparkles, Layers, Zap, Download, Move, Palette } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Vector Studio</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Launch Studio
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">100% Vector Design</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Create. Assemble. Animate.
            </h1>

            <p className="text-2xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              The next-generation vector studio
            </p>

            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto">
              Logos, modular fragments, and SVG animations — all in one creative workspace
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all hover:scale-105"
              >
                Get Started Free
              </button>
              <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-semibold text-lg hover:border-slate-300 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="AI-Powered Generation"
              description="Generate beautiful logos and vector fragments instantly with AI assistance"
            />
            <FeatureCard
              icon={<Move className="w-8 h-8" />}
              title="Modular Design System"
              description="Compose designs from reusable fragments with full transform control"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Built-in Animation"
              description="Add smooth SVG animations with simple, intuitive controls"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-12 mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">
                  Truly 100% Vectorial
                </h2>
                <ul className="space-y-4">
                  <BenefitItem text="No pixelated images, ever" />
                  <BenefitItem text="Infinite scalability without quality loss" />
                  <BenefitItem text="Clean, readable SVG code" />
                  <BenefitItem text="Fully editable at any time" />
                  <BenefitItem text="Export to any format" />
                </ul>
              </div>
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl p-8 aspect-square flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-sm">
                  <circle cx="100" cy="100" r="80" fill="#1e293b" opacity="0.1" />
                  <circle cx="100" cy="100" r="60" fill="#1e293b" opacity="0.2" />
                  <circle cx="100" cy="100" r="40" fill="#1e293b" opacity="0.3" />
                  <path d="M100,20 L180,100 L100,180 L20,100 Z" fill="#1e293b" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Three Powerful Modes
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to create professional vector graphics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <ModeCard
              title="Logo Mode"
              description="Generate complete logos from a simple brief. AI creates multiple variations for you to refine and customize."
              features={['AI-powered generation', 'Multiple variations', 'Instant refinement']}
            />
            <ModeCard
              title="Fragments Mode"
              description="Build from modular vector pieces. Mix, match, and compose unique designs from a library of shapes."
              features={['Modular components', 'Custom library', 'Drag & drop']}
            />
            <ModeCard
              title="Motion Mode"
              description="Add life to your designs with built-in animations. Rotation, pulsation, oscillation, and more."
              features={['Simple animations', 'Real-time preview', 'Export animated SVG']}
            />
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-12 text-center text-white">
            <Download className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">
              Export Anywhere
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Download clean SVG files ready for web, print, or further editing in any vector software
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors"
            >
              Start Creating Now
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-600">
          <p>Vector Design Studio - Pure vectorial creativity</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-700">
      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span>{text}</span>
    </li>
  );
}

function ModeCard({ title, description, features }: { title: string; description: string; features: string[] }) {
  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
