import './visual-diff-app';
import db from 'visual-diff-db'; // dynamic

const app = document.createElement('visual-diff-app');
app.innerHTML = JSON.stringify(db);
document.body.appendChild(app);
