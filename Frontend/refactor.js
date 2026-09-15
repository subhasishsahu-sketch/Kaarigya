const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\swaya\\Desktop\\Kalakriti_full\\Frontend\\src\\components';

function getFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getFiles(dir);

const routeMap = {
  "'landing'": "'/'",
  "'verify-passport'": "'/verify-passport'",
  "'counterfeit-alert'": "'/counterfeit-alert'",
  "'artisan-dashboard'": "'/artisan/dashboard'",
  "'artisan-register'": "'/artisan/register'",
  "'artisan-products'": "'/artisan/products'",
  "'artisan-profile'": "'/artisan/profile'",
  "'coop-overview'": "'/cooperative/dashboard'",
  "'coop-verification'": "'/cooperative/verification'",
  "'coop-alerts'": "'/cooperative/alerts'",
  "'coop-artisans'": "'/cooperative/artisans'",
  "'coop-compensation'": "'/cooperative/compensation'",
  "'coop-disputes'": "'/cooperative/disputes'",
  "'admin-overview'": "'/admin/dashboard'",
  "'admin-dashboard'": "'/admin/dashboard'",
  "'admin-users'": "'/admin/users'",
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove navigate from useApp() and add useNavigate
  if (content.includes('useApp()') && content.match(/navigate\b/)) {
    // Check if it's destructured
    if (content.match(/const\s+\{([^}]*)navigate([^}]*)\}\s*=\s*useApp\(\)/)) {
      content = content.replace(/const\s+\{([^}]*)navigate\s*,?\s*([^}]*)\}\s*=\s*useApp\(\)/, (match, p1, p2) => {
        let newDestruct = p1.trim() + (p1.trim() && p2.trim() ? ', ' : '') + p2.trim();
        newDestruct = newDestruct.replace(/,\s*,/g, ',').replace(/,\s*$/, '').replace(/^,\s*/, '');
        if (newDestruct) {
          return `const { ${newDestruct} } = useApp();\n  const navigate = useNavigate();`;
        } else {
          return `const navigate = useNavigate();`; // if navigate was the only one
        }
      });
      
      // Add import if not present
      if (!content.includes('useNavigate')) {
        content = "import { useNavigate } from 'react-router-dom';\n" + content;
      }
    }
  }

  // 2. Replace navigate('some-view') with navigate('/some/path')
  for (const [key, value] of Object.entries(routeMap)) {
    content = content.replace(new RegExp(`navigate\\(${key}\\)`, 'g'), `navigate(${value})`);
  }

  // 3. Replace navigate('verify-passport', id) -> navigate(`/verify/${id}`)
  content = content.replace(/navigate\('verify-passport',\s*([^)]+)\)/g, 'navigate(`/verify/${$1}`)');

  // 4. Special cases in Footer and others that might have navigate('/something') inside useApp hook
  // Oh wait, `Footer` already fixed? No, I didn't fix `Footer`.

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
