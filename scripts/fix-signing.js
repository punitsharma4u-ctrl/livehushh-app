const fs = require('fs');

const TEAM_ID = '464BK7HBM4';
const PROFILE_NAME = 'livehushh AppStore';
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

// 5. Set PROVISIONING_PROFILE_SPECIFIER in App target build settings only
//    (removing any existing first to avoid duplicates, then adding after DEVELOPMENT_TEAM)
content = content.replace(/\n[ \t]*PROVISIONING_PROFILE_SPECIFIER = [^;]*;/g, '');
content = content.replace(
  /DEVELOPMENT_TEAM = 464BK7HBM4;/g,
  `DEVELOPMENT_TEAM = ${TEAM_ID};\n\t\t\t\tPROVISIONING_PROFILE_SPECIFIER = "${PROFILE_NAME}";`
);

// 6. Fix TargetAttributes - set DevelopmentTeam and ProvisioningStyle = Manual
content = content.replace(/ProvisioningStyle = Automatic;/g, 'ProvisioningStyle = Manual;');
// Add DevelopmentTeam before ProvisioningStyle if not already there
content = content.replace(
  /(\t+)(ProvisioningStyle = Manual;)/g,
  (match, tabs, ps) => {
    return `${tabs}DevelopmentTeam = ${TEAM_ID};\n${tabs}${ps}`;
  }
);
// Avoid duplicate DevelopmentTeam entries
content = content.replace(/(\t+DevelopmentTeam = [^;]+;\n)+/g, `\t\t\t\t\tDevelopmentTeam = ${TEAM_ID};\n`);

fs.writeFileSync(PBXPROJ, content, 'utf8');

const teamCount = (content.match(/DEVELOPMENT_TEAM = 464BK7HBM4/g) || []).length;
const styleCount = (content.match(/CODE_SIGN_STYLE = Manual/g) || []).length;
const identityCount = (content.match(/CODE_SIGN_IDENTITY = "Apple Distribution"/g) || []).length;
const profileCount = (content.match(/PROVISIONING_PROFILE_SPECIFIER/g) || []).length;

console.log(`✅ fix-signing.js complete:`);
console.log(`   DEVELOPMENT_TEAM set: ${teamCount} times`);
console.log(`   CODE_SIGN_STYLE = Manual: ${styleCount} times`);
console.log(`   CODE_SIGN_IDENTITY = Apple Distribution: ${identityCount} times`);
console.log(`   PROVISIONING_PROFILE_SPECIFIER set: ${profileCount} times`);
