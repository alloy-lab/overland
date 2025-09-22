#!/bin/bash

# Overland Stack - Complete Development Setup
# This script handles the entire local development workflow
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    local missing_deps=()

    # Check Node.js
    if ! command_exists node; then
        missing_deps+=("Node.js (22 or higher)")
    else
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 22 ]; then
            missing_deps+=("Node.js 22 or higher (current: $(node --version))")
        fi
    fi

    # Check pnpm
    if ! command_exists pnpm; then
        missing_deps+=("pnpm")
    fi

    # Check Docker (optional but recommended)
    if ! command_exists docker; then
        print_warning "Docker not found. You can still develop locally, but Docker is recommended for the full experience."
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Installation instructions:"
        echo "  Node.js: https://nodejs.org/"
        echo "  pnpm: npm install -g pnpm"
        exit 1
    fi

    print_success "All prerequisites met!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."

    if [ ! -f .env ]; then
        print_status "Generating environment configuration..."

        # Use Node.js to generate a proper .env file with secure defaults
        if command_exists node; then
            node scripts/generate-env.js
            print_success "Generated .env with secure defaults"
        else
            # Fallback to copying example
            if [ -f env.example ]; then
                cp env.example .env
                print_success "Created .env from env.example"
                print_warning "Please update .env with your configuration:"
                echo "  - Set PAYLOAD_SECRET to a secure random string"
                echo "  - Configure database connection if needed"
                echo "  - Update any other environment-specific settings"
                echo ""
                read -p "Press Enter to continue after updating .env..."
            else
                print_error "env.example not found. Please create a .env file manually."
                exit 1
            fi
        fi
    else
        print_success ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."

    if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
        pnpm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Function to start development
start_development() {
    print_status "Starting development environment..."

    echo ""
    print_success "🚀 Overland Stack is ready for development!"
    echo ""
    echo "Available commands:"
    echo "  pnpm dev          - Start all development servers"
    echo "  pnpm build        - Build all packages"
    echo "  pnpm start        - Start production servers"
    echo "  pnpm test         - Run tests"
    echo ""
    echo "Services will be available at:"
    echo "  Web App:          http://localhost:3000"
    echo "  CMS Admin:        http://localhost:3001/admin"
    echo "  CMS API:          http://localhost:3001/api"
    echo ""

    # Ask if user wants to start development servers
    read -p "Start development servers now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting development servers..."
        pnpm dev
    else
        print_status "Run 'pnpm dev' when you're ready to start development"
    fi
}

# Function to show help
show_help() {
    echo "Overland Stack Development Setup"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h        Show this help message"
    echo "  --env-only        Only setup environment file"
    echo "  --install-only    Only install dependencies"
    echo "  --no-start        Setup everything but don't start dev servers"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites (Node.js, pnpm, Docker)"
    echo "  2. Setup environment configuration"
    echo "  3. Install dependencies"
    echo "  4. Optionally start development servers"
}

# Main execution
main() {
    echo "🏔️  Overland Stack - Development Setup"
    echo "======================================"
    echo ""

    # Parse command line arguments
    ENV_ONLY=false
    INSTALL_ONLY=false
    NO_START=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --env-only)
                ENV_ONLY=true
                shift
                ;;
            --install-only)
                INSTALL_ONLY=true
                shift
                ;;
            --no-start)
                NO_START=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Execute setup steps
    check_prerequisites

    if [ "$ENV_ONLY" = true ]; then
        setup_environment
        print_success "Environment setup complete!"
        exit 0
    fi

    if [ "$INSTALL_ONLY" = true ]; then
        install_dependencies
        print_success "Dependencies installed!"
        exit 0
    fi

    setup_environment
    install_dependencies

    if [ "$NO_START" = false ]; then
        start_development
    else
        print_success "Setup complete! Run 'pnpm dev' to start development."
    fi
}

# Run main function
main "$@"
