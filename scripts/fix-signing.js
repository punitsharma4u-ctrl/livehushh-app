const fs = require('fs');

const TEAM_ID = '464BK7HBM4';
const PBXPROJ = 'ios/App/App.xcodeproj/project.pbxproj';

let content = fs.readFileSync(PBXPROJ, 'utf8');

// 1. Replace CODE_SIGN_IDENTITY
content = content.replace(/CODE_SIGN_IDENTITY = "iPhone Developer";/g, 'CODE_SIGN_IDENTITY = "Apple Distribution";');
content = content.replace(/CODE_SIGN_IDENTITY = "iPhone Distribution";/g, 'CODE_SIGN_IDENTITY = "Apple Distribution";');

// 2. Set CODE_SIGN_STYLE to Manual
content = content.replace(/CODE_SIGN_STYLE = Automatic;/g, 'CODE_SIGN_STYLE = Manual;');

// 3. Add or replace DEVELOPMENT_TEAM after CODE_SIGN_STYLE
content = content.replace(
  /(CODE_SIGN_STYLE = Manual;)\n(\s*)(DEVELOPMENT_TEAM = .*;)/g,
  `$1\n$2DEVELOPMENT_TEAM = ${TEAM_ID};`
);
// If DEVELOPMENT_TEAM doesn't exist after CODE_SIGN_STYLE, add it
content = content.replace(
  /(CODE_SIGN_STYLE = Manual;)(?!\s*\n\s*DEVELOPMENT_TEAM)/g,
  `$1\n\t\t\t\tDEVELOPMENT_TEAM = ${TEAM_ID};`
);

// 4. Replace existing empty DEVELOPMENT_TEAM
content = content.replace(/DEVELOPMENT_TEAM = "";/g, `DEVELOPMENT_TEAM = ${TEAM_ID};`);
content = content.replace(/DEVELOPMENT_TEAM = ;/g, `DEVELOPMENT_TEAM = ${TEAM_ID};`);

// 5. Fix TargetAttributes - set DevelopmentTeam and ProvisioningStyle
content = content.replace(/ProvisioningStyle = Automatic;/g, 'ProvisioningStyle = Manual;');
// Add DevelopmentTeam in TargetAttributes if missing
content = content.replace(
  /(TargetAttributes = \{[^}]*?[0-9A-F]{24} = \{)([^}]*?)(ProvisioningStyle = Manual;)/gs,
  (match, open, middle, ps) => {
    if (!middle.includes('DevelopmentTeam')) {
      return `${open}\n\t\t\t\t\tDevelopmentTeam = ${TEAM_ID};${middle}${ps}`;
    }
    return match;
  }
);

fs.writeFileSync(PBXPROJ, content, 'utf8');

const teamCount = (content.match(/DEVELOPMENT_TEAM = 464BK7HBM4/g) || []).length;
const styleCount = (content.match(/CODE_SIGN_STYLE = Manual/g) || []).length;
const identityCount = (content.match(/CODE_SIGN_IDENTITY = "Apple Distribution"/g) || []).length;

console.log(`✅ fix-signing.js complete:`);
console.log(`   DEVELOPMENT_TEAM set: ${teamCount} times`);
console.log(`   CODE_SIGN_STYLE = Manual: ${styleCount} times`);
console.log(`   CODE_SIGN_IDENTITY = Apple Distribution: ${identityCount} times`);
