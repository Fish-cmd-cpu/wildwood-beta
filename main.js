import { SaveManager } from './save/SaveManager.js';

const saves = new SaveManager();
Promise.all([import('./core/Engine.js'), saves.load()])
  .then(([{ Engine }, saved]) => { new Engine(saves, saved); })
  .catch(() => {
    const panel = document.getElementById('welcome');
    panel.querySelector('h1').textContent = 'A little pause.';
    panel.querySelector('p').textContent = 'Wildwood needs WebGL and browser workers. Enable hardware acceleration, then reload to grow your world.';
    document.getElementById('enter-world').disabled = false;
    document.getElementById('enter-label').textContent = 'Try again';
    document.getElementById('enter-world').onclick = () => location.reload();
    document.getElementById('loading-progress').hidden = true;
    document.getElementById('mode-description').textContent = 'Your saved adventure stays safe.';
  });
