import { Link, Outlet } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AuthLayout = () => {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* ---- LEFT SIDE: Branding / Decoration ---- */}
        <div className="hidden lg:flex relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-background border border-border/50">
          
          {/* Decorative floating shapes */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/5 blur-2xl" />
          
          {/* Content (positioned relative) */}
          <div className="relative z-10 flex flex-col justify-center space-y-8">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-block">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  WorkStackHub
                </span>
              </Link>
              <p className="text-muted-foreground mt-2 text-lg">
                Track proposals. Win clients. Get paid.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-foreground">Automated proposal tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-foreground">Client & project management</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-foreground">Team collaboration & roles</span>
              </div>
            </div>

            {/* Decorative shape (small) */}
            <div className="mt-4 relative">
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>

        {/* ---- RIGHT SIDE: Form Card ---- */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:justify-self-end">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 md:p-8">
            <Outlet />
          </div>
        </div>

        {/* ---- Mobile: Branding above form ---- */}
        <div className="lg:hidden text-center mb-4">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              WorkStackHub
            </span>
          </Link>
          <p className="text-muted-foreground text-sm mt-1">
            Track proposals. Win clients. Get paid.
          </p>
        </div>

      </div>
    </main>
  );
};

export default AuthLayout;