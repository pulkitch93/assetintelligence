const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Designed & Developed by{" "}
          <a 
            href="https://www.linkedin.com/in/pulkit-chaudhary" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary transition-colors underline"
          >
            Pulkit Chaudhary
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
