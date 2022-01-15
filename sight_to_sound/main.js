// Setup

var canvas = document.querySelector('canvas');

canvas.width = 1500;
canvas.height = 800;

var c = canvas.getContext('2d');

var character = new Character();

var scope_count = 17;
var distances = [];
var sineWaves = [];
var whiteNoises = [];
var stereoPanners = [];

// Events
// window.addEventListener('mousemove', function (mouse) {
// });

// window.addEventListener('resize', function () {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// });

var dir = {
    left: 0,
    up: 0,
    right: 0,
    down: 0
}

var sensitive = 1;

window.addEventListener('keydown', function keyDownTextField(e) {
    switch (e.key) {
        case "a":
            dir.left = 1;
            break;
        case "w":
            dir.up = 1;
            break;
        case "d":
            dir.right = 1;
            break;
        case "s":
            dir.down = 1;
            break;
        case 65:
            sensitive = 0.2;
            break;
        case "u": // U
            sineWaves.forEach((wave) => {
                wave.play();
                wave.stop();
            });
            whiteNoises.forEach((noise) => {
                noise.play();
            });
            break;
        case "i": // I
            whiteNoises.forEach((noise) => {
                noise.stop();
            });
            break;

        default:
            // code block
    }
});
window.addEventListener('keyup', function keyDownTextField(e) {
    switch (e.key) {
        case "a":
            dir.left = 0;
            break;
        case "w":
            dir.up = 0;
            break;
        case "d":
            dir.right = 0;
            break;
        case "s":
            dir.down = 0;
            break;
        case 65:
            sensitive = 1;
            break;
        default:
            // code block
    }
});


function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}



// Classes

function Color(r, g, b) {
    this.color = [r, g, b];

    this.getHex = function () {
        return hex = "#" + ("000000" + rgbToHex(this.color[0], this.color[1], this.color[2])).slice(-6);
    }
}

// UNUSED CLASS
function Circle(id, x, y, r, dx, dy, dr, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;

    this.draw = function () {
        c.strokeStyle = color.getHex();
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        c.stroke();
    }

    this.update = function () { /*nothing yet*/ }
}

function Character(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.mag = 2;

    this.draw = function () {
        c.strokeStyle = "#ffffff";
        c.beginPath();
        c.arc(this.x, this.y, 10, 0, Math.PI * 2, true);
        c.stroke();

        var scopes = [];
        var scope_angle = 0;

        for (var j = -1 * Math.floor(scope_count / 2); j < Math.ceil(scope_count / 2); j++) {
          // var scope_angle = this.angle + Math.PI / 4;
          scope_angle = this.angle + j * Math.PI / (scope_count - 1);
          var scope = {
              angle: scope_angle,
              dist: 0,
              x: this.x + 13 * Math.cos(scope_angle),
              y: this.y + 13 * Math.sin(scope_angle),
              color: "#ffff00"
          }
          scopes.push(scope);
        }

        for (var j = 0; j < scope_count; j++) {
          c.moveTo(this.x, this.y);
          scopes[j].dist = 0;
          var loop_limit = 0;
          do {
              c.lineTo(scopes[j].x, scopes[j].y);
              scopes[j].x += 10 * Math.cos(scopes[j].angle);
              scopes[j].y += 10 * Math.sin(scopes[j].angle);
              scopes[j].dist++;

              var p = c.getImageData(scopes[j].x, scopes[j].y, 1, 1).data;
              var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

              loop_limit += 1

          } while (hex == "#000000" && loop_limit < 100);
          c.strokeStyle = scopes[j].color;
          c.stroke();
          distances[j] = scopes[j].dist;

          // Here we set the volumes based on the distanced calculated.
          whiteNoises[j].volume = Math.min(0.1 / distances[j], 0.02);
          // not great:       whiteNoises[j].volume = Math.pow(distances[j] - 80, 4) / 270000000;
        }
    }

    this.update = function () {
        if (dir.left == 1 && dir.right == 0) {
            this.angle -= 0.05 * sensitive;
        } else if (dir.left == 0 && dir.right == 1) {
            this.angle += 0.05 * sensitive;
        }

        var prev_x = this.x;
        var prev_y = this.y;

        if (dir.up == 1 && dir.down == 0) {
            this.x += this.mag * (Math.cos(this.angle)) * sensitive;
            this.y += this.mag * (Math.sin(this.angle)) * sensitive;
        } else if (dir.up == 0 && dir.down == 1) {
            this.x -= this.mag * (Math.cos(this.angle)) * sensitive;
            this.y -= this.mag * (Math.sin(this.angle)) * sensitive;
        }

        if (this.x < 35 || this.x > canvas.innerWidth - 35) this.x = prev_x;
        if (this.y < 35 || this.y > canvas.innerHeight - 35) this.y = prev_y;
    }
}

function RectObst() {
    this.x_pos = 200 + Math.floor(Math.random()*800);
    this.y_pos = -150 + Math.floor(Math.random()*800);
    this.x_size = 50 + Math.floor(Math.random()*200);
    this.y_size = 50 + Math.floor(Math.random()*200);

    this.draw = function() {
        c.fillRect(this.x_pos, this.y_pos, this.x_size, this.y_size);
    }

    this.update = function() { /* nothing yet */ }
}




// Logic

for (var i = 0; i < scope_count; i++) {
    sineWaves[i] = new Pizzicato.Sound({ 
        source: 'wave', 
        options: {
            frequency: 5
        }
    });
    // sineWaves[i].play();
    whiteNoises[i] = new Pizzicato.Sound(function(e) {

        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < e.outputBuffer.length; i++)
            output[i] = Math.random();
    });
    stereoPanners[i] = new Pizzicato.Effects.StereoPanner({
        pan: -0.8 + i * 0.1
    });
    whiteNoises[i].volume = 0.1;

    whiteNoises[i].addEffect(stereoPanners[i]);
    // whiteNoises[i].play();
    // sineWaves[i].stop();
}




var drawings = [];


var num_obstacles = 12;

for (var i = 0; i < num_obstacles; i++) {
    drawings[i] = new RectObst();
}

drawings[num_obstacles] = new Character(100, 350);



// Draw

function animate() {
    requestAnimationFrame(animate);
    //bg
    c.fillStyle = "#000000";
    c.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    // set up map
    c.fillStyle = "#ffffff";
    // c.fillRect(0, 0, window.innerWidth, 25);
    // c.fillRect(0, window.innerHeight - 25, window.innerWidth, 25);
    // c.fillRect(0, 0, 25, window.innerHeight);
    // c.fillRect(window.innerWidth - 25, 0, 25, window.innerHeight);

    drawings.forEach((drawing) => {
        drawing.draw();
        drawing.update();
    });
}

animate();




// Junk

/*
c.fillStyle = 'rgba(255, 0, 0, 0.5)';
c.fillRect(100, 100, 100, 100);

// Line
c.strokeStyle = "#f514cd";
c.beginPath();

var x = 50;
var y = 300;

c.moveTo(x, y);

while (x < 700) {
    c.lineTo(x, y);
    y = 300 + 100*Math.sin(1000 / x);
    x++;
}

c.stroke();



c.beginPath();
c.arc(300, 300, 30, 0, Math.PI * 2, false);
c.stroke();
*/
