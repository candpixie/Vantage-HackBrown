# Repository Organization

This document describes the organization of files and folders in the Vantage repository.

## Directory Structure

```
hackbrown-2/
├── README.md                    # Main project documentation
├── app.py                       # Flask entrypoint (for deployment)
├── requirements.txt            # Python dependencies
├── Procfile                    # Process file (Heroku/Railway)
├── vercel.json                 # Vercel deployment config
│
├── backend/                    # Backend code
│   ├── agents/                 # Multi-agent system
│   ├── data/                   # Data files
│   └── *.py                    # Backend services
│
├── frontend/                    # Frontend code
│   └── ui/                     # React application
│
├── maps/                       # Alternative map implementation
│
├── docs/                       # Documentation
│   ├── agentverse/            # Agentverse deployment docs
│   ├── aws/                   # AWS setup and migration docs
│   ├── setup/                 # Setup guides
│   ├── troubleshooting/       # Troubleshooting guides
│   └── *.md                   # General documentation
│
├── deployment/                 # Deployment configurations
│   ├── railway.toml          # Railway deployment config
│   └── runtime.txt           # Python runtime version
│
├── scripts/                    # Utility scripts
│   ├── deploy_*.sh/.py        # Deployment scripts
│   ├── test_*.py              # Testing scripts
│   ├── check_*.sh             # System check scripts
│   └── setup_*.sh             # Setup scripts
│
└── testing/                    # Testing documentation
```

## Documentation Categories

### Agentverse (`docs/agentverse/`)
- Agentverse setup and deployment guides
- Configuration files
- Alternative deployment methods

### AWS (`docs/aws/`)
- AWS credentials setup
- S3 migration guides

### Setup (`docs/setup/`)
- Google Maps API setup
- Server startup guides

### Troubleshooting (`docs/troubleshooting/`)
- Common issues and solutions
- Map-related troubleshooting

### General Docs (`docs/`)
- Backend status
- Security guidelines
- UI revamp plans
- Vercel deployment guide

## Deployment Files

- **Root level**: `Procfile`, `vercel.json` (required by platforms)
- **deployment/**: `railway.toml`, `runtime.txt` (platform-specific)

## Scripts

All utility scripts are organized in `scripts/`:
- Deployment scripts
- Testing scripts
- System checks
- Setup utilities
