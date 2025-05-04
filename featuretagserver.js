const express = require('express');
const fs = require('fs');
const path = require('path');
let open; // Declare a variable for the 'open' module

const app = express();
const port = 3000;

(async () => {
  open = (await import('open')).default; // Dynamically import the 'open' module

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    open(`http://localhost:${port}`); // Automatically open GenerateFeaturesAndTags.html in the browser
  });
})();

function getFeatureFiles(dir, fileList = []) {
   const files = fs.readdirSync(dir, { withFileTypes: true });
   files.forEach(file => {
      if (file.isDirectory()) {
         fileList = getFeatureFiles(path.join(dir, file.name), fileList);
      } else if (file.isFile() && file.name.endsWith('.feature')) {
         fileList.push(path.join(dir, file.name));
      }
   });
   return fileList;
}
 
function extractTags(content) {
   const tagRegex = /@\w+/g;
   const allTags = content.match(tagRegex) || [];
   // Filter tags to exclude those shorter than 7 characters (excluding @)
   const validTags = allTags.filter(tag => tag.length > 7);
   return validTags;
}
 
function getSubfolders(dir) {
   const subfolders = [];
   const entries = fs.readdirSync(dir, { withFileTypes: true });
 
   entries.forEach(entry => {
      if (entry.isDirectory()) {
         const subfolderPath = path.join(dir, entry.name);
         subfolders.push({
            name: entry.name,
            path: subfolderPath,
            subfolders: getSubfolders(subfolderPath) // Recursively fetch subfolders
         });
      }
   });
 
   return subfolders;
}
 
app.get('/list-files', (req, res) => {
   const dir = req.query.dir;
   if (!dir) {
      console.error('Directory parameter is missing');
      return res.status(400).send('Directory parameter is missing');
   }
   console.log(`Scanning directory recursively: ${dir}`);
   try {
      const filePaths = getFeatureFiles(dir); // Already recursive
      console.log(`Found files: ${filePaths}`);
      res.json(filePaths);
   } catch (err) {
      console.error(`Unable to scan directory: ${err}`);
      res.status(500).send('Unable to scan directory');
   }
});
 
app.get('/list-subfolders', (req, res) => {
   const dir = req.query.dir;
   if (!dir) {
      console.error('Directory parameter is missing');
      return res.status(400).send('Directory parameter is missing');
   }
   console.log(`Scanning directory for subfolders recursively: ${dir}`);
   try {
      const subfolders = getSubfolders(dir); // Fetch hierarchical subfolders
      console.log(`Found subfolders: ${JSON.stringify(subfolders)}`);
      res.json(subfolders);
   } catch (err) {
      console.error(`Unable to scan directory for subfolders: ${err}`);
      res.status(500).send('Unable to scan directory for subfolders');
   }
});
 
app.get('/feature-tags', (req, res) => {
   const filePath = req.query.file;
   if (!filePath) {
      console.error('File parameter is missing');
      return res.status(400).send('File parameter is missing');
   }
   console.log(`Reading file: ${filePath}`);
   try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const tags = extractTags(content);
      console.log(`Found tags: ${tags}`);
      res.json(tags);
   } catch (err) {
      console.error(`Unable to read file: ${err}`);
      res.status(500).send('Unable to read file');
   }
});
 
app.post('/tags-from-files', express.json(), (req, res) => {
   const files = req.body.files;
   if (!files || !Array.isArray(files)) {
      console.error('Files parameter is missing or invalid');
      return res.status(400).send('Files parameter is missing or invalid');
   }
   console.log(`Processing files: ${files}`);
   try {
      const result = files.map(filePath => {
         try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const tags = extractTags(content);
            return { file: filePath, tags };
         } catch (err) {
            console.error(`Unable to read file: ${filePath}, Error: ${err}`);
            return { file: filePath, error: 'Unable to read file' };
         }
      });
      console.log(`Tags extracted: ${JSON.stringify(result)}`);
      res.json(result);
   } catch (err) {
      console.error(`Error processing files: ${err}`);
      res.status(500).send('Error processing files');
   }
});
 
app.use('/features', express.static(path.join(__dirname, 'e2e/features')));
 
app.use(express.static(path.join(__dirname)));
 
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'GenerateFeaturesAndTags.html'));
});

