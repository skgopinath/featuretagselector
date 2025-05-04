const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'e2e/features');
const folders = [
  'Createaccount', 'policyinfo', 'location', 
  'Uivalidation', 'APIvalidation', 'DBTesting'
];
const featureCount = 50;

function createFeatureFiles() {
  folders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    for (let i = 1; i <= featureCount; i++) {
      const featureFilePath = path.join(folderPath, `feature_${i}.feature`);
      const content = `
@${folder}_tag_${i}
Feature: Unique feature ${i} for ${folder}

  @${folder}_scenario_tag_${i}
  Scenario: Unique scenario ${i}
    Given a precondition
    When an action is performed
    Then an expected result is observed
      `;
      fs.writeFileSync(featureFilePath, content.trim());
    }
  });
  console.log('Feature files with unique tags generated successfully.');
}

createFeatureFiles();
