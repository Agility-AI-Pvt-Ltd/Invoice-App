const Footer = () => {
    return (
      <footer className="bg-background-secondary border-t border-border py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img
                src="/agility.jpg"
                alt="Agility Logo"
                className="w-full h-full object-cover"
              />
            </div>
                <span className="text-lg font-semibold text-foreground">Invoice App</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The complete billing solution for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 Invoice App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;