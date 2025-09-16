
// 3D Platformer Game
let scene, camera, renderer;
let player, playerObject;
let playerVelocity = new THREE.Vector3();
let playerOnGround = false;
let platforms = [];
let collectibles = [];
let score = 0;
let lives = 3;
let level = 1;

// Game constants
const GRAVITY = 0.005;
const JUMP_FORCE = 0.18;
const PLAYER_SPEED = 0.1;
const PLAYER_SIZE = 0.5;

// Initialize the game
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue
  
  // Setup camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Setup renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xCCCCCC, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);
  
  // Create player
  createPlayer();
  
  // Create level
  createLevel(level);
  
  // Setup controls
  setupControls();
  
  // Update score display
  updateHUD();
  
  // Start game loop
  animate();
}

// Create player character
function createPlayer() {
  const geometry = new THREE.SphereGeometry(PLAYER_SIZE, 16, 16);
  const material = new THREE.MeshLambertMaterial({ 
    color: 0xFF5555,
    transparent: true,
    opacity: 0, // Make completely invisible
  });
  playerObject = new THREE.Mesh(geometry, material);
  
  // Starting position
  playerObject.position.set(0, 5, 0);
  
  scene.add(playerObject);
  
  // Create a container for the player and camera
  player = new THREE.Object3D();
  player.position.copy(playerObject.position);
  
  // Position camera at player's eye level
  camera.position.set(0, 0.7, 0);
  player.add(camera);
  scene.add(player);
}

// Create game level
function createLevel(levelNum) {
  // Clear existing level
  platforms.forEach(platform => scene.remove(platform));
  collectibles.forEach(collectible => scene.remove(collectible));
  platforms = [];
  collectibles = [];
  
  // Create ground
  const groundGeometry = new THREE.BoxGeometry(20, 1, 20);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x44AA44 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.set(0, -0.5, 0);
  scene.add(ground);
  platforms.push(ground);
  
  // Design level based on level number
  switch(levelNum) {
    case 1:
      createPlatform(5, 2, 0, 3, 0.5, 3);
      createPlatform(10, 4, 0, 3, 0.5, 3);
      createPlatform(15, 6, 0, 3, 0.5, 3);
      createPlatform(20, 8, 0, 5, 0.5, 5); // Goal platform
      
      // Add collectibles
      createCollectible(5, 3, 0);
      createCollectible(10, 5, 0);
      createCollectible(15, 7, 0);
      break;
      
    case 2:
      createPlatform(3, 2, -3, 2, 0.5, 2);
      createPlatform(7, 3, 0, 2, 0.5, 2);
      createPlatform(10, 4, 3, 2, 0.5, 2);
      createPlatform(13, 5, 0, 2, 0.5, 2);
      createPlatform(16, 6, -3, 2, 0.5, 2);
      createPlatform(20, 8, 0, 5, 0.5, 5); // Goal platform
      
      // Add collectibles
      createCollectible(3, 3, -3);
      createCollectible(7, 4, 0);
      createCollectible(10, 5, 3);
      createCollectible(13, 6, 0);
      createCollectible(16, 7, -3);
      break;
      
    case 3:
      // Create a more complex level with moving platforms
      createPlatform(4, 2, -2, 2, 0.5, 2);
      createPlatform(8, 3, 2, 2, 0.5, 2);
      createPlatform(12, 4, -3, 2, 0.5, 2);
      createPlatform(16, 5, 3, 2, 0.5, 2);
      createPlatform(20, 7, 0, 5, 0.5, 5); // Goal platform
      
      // Create moving platform
      const movingPlatform = createPlatform(10, 3, 0, 3, 0.5, 1, 0xFF00FF);
      movingPlatform.userData.movingSpeed = 0.03;
      movingPlatform.userData.movingRange = 5;
      movingPlatform.userData.originalZ = 0;
      
      // Add collectibles
      createCollectible(4, 3, -2);
      createCollectible(8, 4, 2);
      createCollectible(12, 5, -3);
      createCollectible(16, 6, 3);
      break;
      
    case 4:
      // Spiral staircase level
      createPlatform(5, 2, 5, 2, 0.5, 2, 0xAA55AA);
      createPlatform(8, 4, 2, 2, 0.5, 2, 0xAA55AA);
      createPlatform(5, 6, -1, 2, 0.5, 2, 0xAA55AA);
      createPlatform(0, 8, 2, 2, 0.5, 2, 0xAA55AA);
      createPlatform(-5, 10, -1, 2, 0.5, 2, 0xAA55AA);
      createPlatform(-8, 12, 3, 2, 0.5, 2, 0xAA55AA);
      createPlatform(-4, 14, 6, 5, 0.5, 5, 0x55AA55); // Goal platform
      
      // Add collectibles in spiral pattern
      createCollectible(5, 3, 5);
      createCollectible(8, 5, 2);
      createCollectible(5, 7, -1);
      createCollectible(0, 9, 2);
      createCollectible(-5, 11, -1);
      createCollectible(-8, 13, 3);
      break;
      
    case 5:
      // Floating islands with disappearing platforms
      createPlatform(5, 2, 0, 3, 0.5, 3, 0x55AAFF);
      
      const disappearingPlatform1 = createPlatform(10, 3, 3, 2.5, 0.5, 2.5, 0xFF5555);
      disappearingPlatform1.userData.disappearing = true;
      disappearingPlatform1.userData.disappearDelay = 1000; // ms
      
      createPlatform(15, 4, 0, 3, 0.5, 3, 0x55AAFF);
      
      const disappearingPlatform2 = createPlatform(10, 5, -3, 2.5, 0.5, 2.5, 0xFF5555);
      disappearingPlatform2.userData.disappearing = true;
      disappearingPlatform2.userData.disappearDelay = 1000; // ms
      
      createPlatform(5, 6, 0, 3, 0.5, 3, 0x55AAFF);
      createPlatform(0, 7, 5, 3, 0.5, 3, 0x55AAFF);
      createPlatform(-5, 8, 0, 5, 0.5, 5, 0x55AA55); // Goal platform
      
      // Add collectibles
      createCollectible(5, 3, 0);
      createCollectible(15, 5, 0);
      createCollectible(5, 7, 0);
      createCollectible(0, 8, 5);
      break;
      
    case 6:
      // Obstacle course with moving platforms
      createPlatform(5, 2, 0, 4, 0.5, 2);
      
      // Moving platforms
      const movingPlatform1 = createPlatform(12, 2, 0, 3, 0.5, 2, 0xFF00FF);
      movingPlatform1.userData.movingSpeed = 0.04;
      movingPlatform1.userData.movingRange = 6;
      movingPlatform1.userData.originalZ = 0;
      movingPlatform1.userData.axis = 'z'; // Move on Z axis
      
      createPlatform(18, 3, 0, 4, 0.5, 2);
      
      const movingPlatform2 = createPlatform(24, 4, 0, 3, 0.5, 2, 0x00FFFF);
      movingPlatform2.userData.movingSpeed = 0.02;
      movingPlatform2.userData.movingRange = 5;
      movingPlatform2.userData.originalX = 24;
      movingPlatform2.userData.axis = 'x'; // Move on X axis
      
      createPlatform(30, 5, 0, 5, 0.5, 5, 0x55AA55); // Goal platform
      
      // Add collectibles
      createCollectible(5, 3, 0);
      createCollectible(12, 3, 3);
      createCollectible(18, 4, 0);
      createCollectible(24, 5, 0);
      break;
  }
  
  // Reset player position
  playerObject.position.set(0, 5, 0);
  player.position.copy(playerObject.position);
  playerVelocity.set(0, 0, 0);
}

// Create a platform
function createPlatform(x, y, z, width, height, depth, color = 0x8888FF) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({ color });
  const platform = new THREE.Mesh(geometry, material);
  platform.position.set(x, y, z);
  scene.add(platform);
  platforms.push(platform);
  return platform;
}

// Create a collectible
function createCollectible(x, y, z) {
  const geometry = new THREE.SphereGeometry(0.3, 8, 8);
  const material = new THREE.MeshLambertMaterial({ color: 0xFFDD00 });
  const collectible = new THREE.Mesh(geometry, material);
  collectible.position.set(x, y, z);
  
  // Add rotation animation
  collectible.userData.rotationSpeed = 0.05;
  collectible.userData.floatSpeed = 0.01;
  collectible.userData.floatAmount = 0.2;
  collectible.userData.originalY = y;
  
  scene.add(collectible);
  collectibles.push(collectible);
  return collectible;
}

// Controls setup
function setupControls() {
  // Keyboard controls
  const keys = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false
  };
  
  // Mouse look variables
  let isPointerLocked = false;
  let mouseX = 0;
  let mouseY = 0;
  let cameraRotationX = 0;
  let cameraRotationY = 0;
  const mouseSensitivity = 0.002;
  
  document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = true;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = false;
    }
  });
  
  // Mouse controls for camera
  const gameContainer = document.getElementById('game-container');
  
  gameContainer.addEventListener('click', () => {
    if (!isPointerLocked) {
      gameContainer.requestPointerLock();
    }
  });
  
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === gameContainer;
  });
  
  document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
      mouseX = event.movementX || 0;
      mouseY = event.movementY || 0;
      
      // Apply mouse movement to camera rotation
      cameraRotationY -= mouseX * mouseSensitivity;
      cameraRotationX -= mouseY * mouseSensitivity;
      
      // Limit vertical camera rotation to prevent flipping
      cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationX));
      
      // Update player rotation
      updateCameraRotation();
    }
  });
  
  function updateCameraRotation() {
    // Reset camera rotation
    camera.rotation.set(0, 0, 0);
    
    // Apply rotations
    camera.rotation.x = cameraRotationX;
    player.rotation.y = cameraRotationY;
  }
  
  // Movement processing in update loop
  window.updatePlayerPosition = () => {
    const direction = new THREE.Vector3();
    
    // Forward/backward
    if (keys.KeyW) {
      direction.z = -1;
    } else if (keys.KeyS) {
      direction.z = 1;
    }
    
    // Left/right
    if (keys.KeyA) {
      direction.x = -1;
    } else if (keys.KeyD) {
      direction.x = 1;
    }
    
    // Normalize direction vector
    if (direction.length() > 0) {
      direction.normalize();
    }
    
    // Convert direction to world coordinates based on player rotation
    const rotatedDirection = direction.clone();
    rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
    
    // Apply player speed
    playerVelocity.x = rotatedDirection.x * PLAYER_SPEED;
    playerVelocity.z = rotatedDirection.z * PLAYER_SPEED;
    
    // Jump
    if (keys.Space && playerOnGround) {
      playerVelocity.y = JUMP_FORCE;
      playerOnGround = false;
      playSound('jump');
    }
    
    // Apply gravity
    playerVelocity.y -= GRAVITY;
    
    // Check for collision and update position
    const oldPosition = playerObject.position.clone();
    const newPosition = oldPosition.clone().add(playerVelocity);
    
    // Check collisions with platforms
    const playerRadius = PLAYER_SIZE;
    
    // Y-axis collision (vertical)
    let floorY = -Infinity;
    let ceilingY = Infinity;
    
    platforms.forEach(platform => {
      const box = new THREE.Box3().setFromObject(platform);
      
      // Check if the player is above the platform and falling
      if (oldPosition.y - playerRadius >= box.max.y && 
          newPosition.y - playerRadius < box.max.y &&
          newPosition.x + playerRadius > box.min.x &&
          newPosition.x - playerRadius < box.max.x &&
          newPosition.z + playerRadius > box.min.z &&
          newPosition.z - playerRadius < box.max.z) {
        floorY = Math.max(floorY, box.max.y + playerRadius);
      }
      
      // Check ceiling collision
      if (oldPosition.y + playerRadius <= box.min.y && 
          newPosition.y + playerRadius > box.min.y &&
          newPosition.x + playerRadius > box.min.x &&
          newPosition.x - playerRadius < box.max.x &&
          newPosition.z + playerRadius > box.min.z &&
          newPosition.z - playerRadius < box.max.z) {
        ceilingY = Math.min(ceilingY, box.min.y - playerRadius);
      }
      
      // Simple X and Z collision
      if (newPosition.y + playerRadius > box.min.y &&
          newPosition.y - playerRadius < box.max.y) {
        
        // X-axis collision
        if (oldPosition.x + playerRadius <= box.min.x &&
            newPosition.x + playerRadius > box.min.x &&
            newPosition.z + playerRadius > box.min.z &&
            newPosition.z - playerRadius < box.max.z) {
          playerVelocity.x = 0;
          newPosition.x = box.min.x - playerRadius;
        }
        
        if (oldPosition.x - playerRadius >= box.max.x &&
            newPosition.x - playerRadius < box.max.x &&
            newPosition.z + playerRadius > box.min.z &&
            newPosition.z - playerRadius < box.max.z) {
          playerVelocity.x = 0;
          newPosition.x = box.max.x + playerRadius;
        }
        
        // Z-axis collision
        if (oldPosition.z + playerRadius <= box.min.z &&
            newPosition.z + playerRadius > box.min.z &&
            newPosition.x + playerRadius > box.min.x &&
            newPosition.x - playerRadius < box.max.x) {
          playerVelocity.z = 0;
          newPosition.z = box.min.z - playerRadius;
        }
        
        if (oldPosition.z - playerRadius >= box.max.z &&
            newPosition.z - playerRadius < box.max.z &&
            newPosition.x + playerRadius > box.min.x &&
            newPosition.x - playerRadius < box.max.x) {
          playerVelocity.z = 0;
          newPosition.z = box.max.z + playerRadius;
        }
      }
    });
    
    // Apply floor and ceiling constraints
    if (newPosition.y < floorY) {
      newPosition.y = floorY;
      playerVelocity.y = 0;
      playerOnGround = true;
      
      // Check for platform interactions (disappearing and moving)
      platforms.forEach(platform => {
        const box = new THREE.Box3().setFromObject(platform);
        const isOnPlatform = Math.abs(newPosition.y - playerRadius - box.max.y) < 0.1 &&
              newPosition.x + playerRadius > box.min.x &&
              newPosition.x - playerRadius < box.max.x &&
              newPosition.z + playerRadius > box.min.z &&
              newPosition.z - playerRadius < box.max.z;
        
        // Check if player is on a disappearing platform
        if (platform.userData.disappearing && !platform.userData.isDisappeared && isOnPlatform) {
          platform.userData.playerWasOn = true;
        }
        
        // Check if player is on a moving platform
        if (platform.userData.movingSpeed && isOnPlatform) {
          // Store the platform the player is standing on
          platform.userData.playerStandingOn = true;
        } else if (platform.userData.playerStandingOn) {
          platform.userData.playerStandingOn = false;
        }
      });
    }
    
    if (newPosition.y > ceilingY) {
      newPosition.y = ceilingY;
      playerVelocity.y = 0;
    }
    
    // Update player position
    playerObject.position.copy(newPosition);
    player.position.copy(newPosition);
    
    // Check for collectibles
    collectibles.forEach((collectible, index) => {
      const distance = playerObject.position.distanceTo(collectible.position);
      if (distance < playerRadius + 0.3) {
        scene.remove(collectible);
        collectibles.splice(index, 1);
        score += 100;
        updateHUD();
        playSound('collect');
      }
    });
    
    // Check if player fell off
    if (playerObject.position.y < -10) {
      loseLife();
    }
    
    // Check if player reached the goal (last platform)
    if (platforms.length > 0) {
      const goalPlatform = platforms[platforms.length - 1];
      const distance = playerObject.position.distanceTo(goalPlatform.position);
      
      if (distance < 3 && collectibles.length === 0) {
        nextLevel();
      }
    }
  };
}

// Lose a life and restart level
function loseLife() {
  lives--;
  updateHUD();
  playSound('die');
  
  if (lives <= 0) {
    // Game over
    gameOver();
  } else {
    // Reset player position
    playerObject.position.set(0, 5, 0);
    player.position.copy(playerObject.position);
    playerVelocity.set(0, 0, 0);
  }
}

// Advance to next level
function nextLevel() {
  level++;
  playSound('levelup');
  
  if (level > 6) {
    // Win the game
    winGame();
  } else {
    createLevel(level);
  }
}

// Game over
function gameOver() {
  alert('Game Over! Your score: ' + score);
  
  // Reset game
  level = 1;
  lives = 3;
  score = 0;
  createLevel(level);
  updateHUD();
}

// Win the game
function winGame() {
  alert('You Win! Your final score: ' + score);
  
  // Reset game
  level = 1;
  lives = 3;
  score = 0;
  createLevel(level);
  updateHUD();
}

// Update HUD
function updateHUD() {
  document.getElementById('score').textContent = 'Score: ' + score;
  document.getElementById('lives').textContent = 'Lives: ' + lives;
  document.getElementById('level').textContent = 'Level: ' + level;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update player position
  window.updatePlayerPosition();
  
  // Animate collectibles
  collectibles.forEach(collectible => {
    collectible.rotation.y += collectible.userData.rotationSpeed;
    collectible.position.y = collectible.userData.originalY + 
                            Math.sin(Date.now() * collectible.userData.floatSpeed) * 
                            collectible.userData.floatAmount;
  });
  
  // Animate moving platforms
  platforms.forEach(platform => {
    if (platform.userData.movingSpeed) {
      // Calculate new position
      let newX = platform.position.x;
      let newZ = platform.position.z;
      
      // Store previous position for calculating delta
      const prevX = platform.position.x;
      const prevZ = platform.position.z;
      
      // Movement pattern based on axis
      if (platform.userData.axis === 'x') {
        newX = platform.userData.originalX + 
               Math.sin(Date.now() * 0.001) * 
               platform.userData.movingRange;
      } else {
        newZ = platform.userData.originalZ + 
               Math.sin(Date.now() * 0.001) * 
               platform.userData.movingRange;
      }
      
      // Update platform position
      platform.position.x = newX;
      platform.position.z = newZ;
      
      // Calculate movement delta
      const deltaX = newX - prevX;
      const deltaZ = newZ - prevZ;
      
      // Move player with platform if standing on it
      if (platform.userData.playerStandingOn && playerOnGround) {
        playerObject.position.x += deltaX;
        playerObject.position.z += deltaZ;
        player.position.x += deltaX;
        player.position.z += deltaZ;
      }
    }
    
    // Handle disappearing platforms
    if (platform.userData.disappearing && platform.userData.playerWasOn) {
      if (!platform.userData.disappearTimer) {
        platform.userData.disappearTimer = setTimeout(() => {
          platform.visible = false;
          platform.userData.isDisappeared = true;
          
          // Reappear after 3 seconds
          setTimeout(() => {
            platform.visible = true;
            platform.userData.isDisappeared = false;
            platform.userData.playerWasOn = false;
            platform.userData.disappearTimer = null;
          }, 3000);
        }, platform.userData.disappearDelay);
      }
    }
  });
  
  renderer.render(scene, camera);
}

// Simple sound system
function playSound(type) {
  // Would implement actual sounds here
  console.log('Playing sound:', type);
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Add resize listener
window.addEventListener('resize', onWindowResize);

// Start the game
window.onload = init;
