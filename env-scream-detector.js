#!/usr/bin/env node

// ENV SCREAM DETECTOR - Because silent failures are scarier than actual errors
// Detects which .env variable is haunting your logs

const fs = require('fs');
const path = require('path');

class EnvScreamDetector {
  constructor() {
    this.envPatterns = [
      // Node's classic "undefined" screams
      /process\.env\.([A-Z_]+)/g,
      /env\.([A-Z_]+)/g,
      // The "cannot read property of undefined" wail
      /Cannot read propert.+of undefined.*env\.([A-Z_]+)/gi,
      // The "is not defined" shriek
      /([A-Z_]+) is not defined/g,
      // Dotenv's "missing" whisper (that's actually a scream)
      /Missing ([A-Z_]+)/g
    ];
  }

  // Listen for the screams in your logs
  detectScreams(logContent) {
    const suspects = new Set();
    
    this.envPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(logContent)) !== null) {
        // Group 1 usually contains our screaming variable
        if (match[1]) {
          suspects.add(match[1].toUpperCase());
        }
      }
    });
    
    return Array.from(suspects);
  }

  // Check if the suspects are actually missing (the autopsy)
  autopsy(suspects) {
    const envPath = path.join(process.cwd(), '.env');
    let existingVars = [];
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      existingVars = envContent
        .split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=')[0].trim().toUpperCase());
    }
    
    // The guilty ones: suspects not in .env
    const missing = suspects.filter(suspect => 
      !existingVars.includes(suspect)
    );
    
    // The misconfigured: in .env but probably empty or wrong
    const misconfigured = suspects.filter(suspect => 
      existingVars.includes(suspect)
    );
    
    return { missing, misconfigured };
  }

  // Main scream analysis
  analyze(logFile) {
    if (!fs.existsSync(logFile)) {
      console.log(`❌ Log file not found: ${logFile}`);
      console.log('Tip: Try screaming louder next time.');
      return;
    }
    
    const logContent = fs.readFileSync(logFile, 'utf8');
    const suspects = this.detectScreams(logContent);
    
    if (suspects.length === 0) {
      console.log('✅ No screams detected. Either perfect code or silent suffering.');
      return;
    }
    
    const { missing, misconfigured } = this.autopsy(suspects);
    
    console.log('🔍 ENV SCREAM ANALYSIS REPORT');
    console.log('=' .repeat(40));
    
    if (missing.length > 0) {
      console.log('\n🚨 MISSING VARIABLES (add to .env):');
      missing.forEach(varName => console.log(`  - ${varName}=your_value_here`));
    }
    
    if (misconfigured.length > 0) {
      console.log('\n⚠️  MISCONFIGURED (check values in .env):');
      misconfigured.forEach(varName => console.log(`  - ${varName}`));
    }
    
    console.log('\n💡 Remember: Environment variables should whisper, not scream.');
  }
}

// CLI interface - because clicking is hard
if (require.main === module) {
  const detector = new EnvScreamDetector();
  
  if (process.argv.length < 3) {
    console.log('Usage: node env-scream-detector.js <logfile>');
    console.log('Example: node env-scream-detector.js error.log');
    console.log('\nPro tip: Your logs are probably screaming right now.');
    process.exit(1);
  }
  
  detector.analyze(process.argv[2]);
}

module.exports = EnvScreamDetector;