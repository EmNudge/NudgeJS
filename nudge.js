/*
NudgeJS is a utility library for JS canvas and general mathematical functions.
Created by EmNudge
*/
const NUDGE = {
  isBtwn: (val, min, max, equals = true) => (
    //returns whether value is between 2 others
    equals ? val >= min && val <= max : val > min && val < max
  ),

  clamp: (value, min, max) => (
    //returns value or bounds value if out-of-bounds
		Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max))
  ),

  map: (val, min, max, min2, max2) => {
    //map val which is contained in range 1 into value as if it were in range 2
    return (val - min) / (max - min) * (max2 - min2) + min2;
  },

  //arguments length is not present in arrow syntax
  random: function(min = 1, max, places = 2) {
    //if given an array as paramter 1, it will return a random value from the array
    if (typeof min === "object") {
      return min[Math.floor(Math.random() * min.length)];
    }
    switch(arguments.length) {
      case 3: //return random value, rounded to places
        return Math.round((Math.random() * (max - min) + min) * 10**places) / 10**places;
      case 2: //return non-rounded range of min to max
        return Math.random() * (max - min) + min;
      default: //if no paramters, returns regular Math.random(). If there are, uses min
        return Math.random() * min;
    }
  },

  multiEqual: (val, ...args) => {
    //check for basic equality with unlimited arguments
    for (const arg of args) {
      if (val === arg) return true;
    }
    
    return false;
  },

  polarityDiv: (val, denom) => {
    //disregard the polarity of the divider and keep the polarity of the divided
    //i.e. 8/-5===1.6 && -8/-5===-1.6 && 8/5===1.6
    return (val < 0 && denom < 0) || (val >= 0 && denom > 0) ? val/denom : val/-denom;
  },

  angledVelocity: (startX, startY, targetX, targetY) => {
    //non-tan2 version of getting velocities based off "angled" targets
    const deltaX = targetX - startX,
        deltaY = targetY - startY;

    //make the larger value equal to 1 and scale the smaller one based off of the larger one
    //using polarityDiv as to not accidentally reverse the velocity direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return { x: NUDGE.polarityDiv(deltaX, deltaX), y: NUDGE.polarityDiv(deltaY, deltaX) };
    } 

    return { x: NUDGE.polarityDiv(deltaX, deltaY), y: NUDGE.polarityDiv(deltaY, deltaY) };
  },

  addObj: (obj1, obj2) => {
    //basically Object.assign(), but doesn't append non-shared properties to object 1
    let addedObj = {};

    for (const val1 in obj1) {
      addedObj[val1] = obj1[val1];
      for (const val2 in obj2) {
        if (val1 === val2) {
          addedObj[val1] += obj2[val2];
        }
      }
    }

    return addedObj;
  },

  randPerimeter: (w, h, x = 0, y = 0) => {
    //returns a random point on the edge of a rectangle
    //user is given the option to provide the starting x,y position which default to nothing
    const point = Math.random() * (w*2 + h*2),
      pos = {x, y};

    if (point <= w) {
    	pos.x = point + x;
    } else if (NUDGE.isBtwn(point, w, w + h)) {
    	pos.x = w + x;
    	pos.y = point - w + y;
    } else if (NUDGE.isBtwn(point, w + h, w * 2 + h)) {
    	pos.y = h + y;
    	pos.x = point - (w + h) + x;
    } else {
    	pos.y = point - (w * 2 + h) + y;
    }

    return pos;
  },

  weightedRand: choices => {
    //example array that this function expects: 
    //[{ val: 49034, chance: 3 }, { val: 'burger', chance: 45 }]
    let total = 0;

    for (const choice of choices) {
      //adds up all chances, negating the need for decimal-only chances
      total += choice.chance;
    }

    const winner = Math.random() * total;

    for (const choice of choices) {
      //if winning number is between the object's chance range, return its name
      if (NUDGE.isBtwn(winner, total - choice.chance, total)) return choice.val;
      total -= choice.chance;
    }
  },

  randColor: () => ({
    r: Math.floor(Math.random() * 255),
    g: Math.floor(Math.random() * 255),
    b: Math.floor(Math.random() * 255),
    a: Math.floor(Math.random() * 255)
  }),

  polarity: num => {
    //return -1 if negative, 1 if positive, and 0 if 0
    return num <= 0 ? num === 0 ? 0 : -1 : 1;
  },

  closer: (num, val1, val2) => {
    //return whichever value num is closer to. returns val1 if exactly in between
    return Math.abs(num - val1) <= Math.abs(num - val2) ? val1 : val2;
  },

  rotateImage: (context, image, angleInRad, positionX, positionY, axisX, axisY) => {
    //just shorter code for rotating an image
    context.translate(positionX, positionY);
    context.rotate(angleInRad);
    context.drawImage(image, -axisX, -axisY);
    context.rotate(-angleInRad);
    context.translate(-positionX, -positionY);
  },

  background: function(context, r, g, b, a = 1) {
    //just a shorter function for defining a colored background
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
  
    if (arguments.length <= 2) {
      opac = arguments[1] || a;
      context.fillStyle = `rgba(${r}, ${r}, ${r}, ${opac})`;
    }
    context.fill();
  },
}

//==============================================
//---------START BOX CLASS----------------------
//==============================================

NUDGE.Box = class {
  constructor(width, height) {
    //shorthand for { height: height, width: width }
    this._dim = { height, width };
    this._dest = { x: 0, y: 0, gravitate: false, speed: 10 };
    this._pos = new NUDGE.Vector();
    
    this._vel = new NUDGE.Vector();
    this._acc = new NUDGE.Vector();
    
    this._col = { r: 0, g: 0, b: 0, a: 1}
    
    return this;
  }
  
  draw(context, unpaused=true) {
    if (unpaused) this.update();
    const { r, g, b, a } = this._col;
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
    context.fillRect(this._pos.x, this._pos.y, this._dim.width, this._dim.height)
  }
  
  update() {
    this._pos.addTo(this._vel);
    this._vel.addTo(this._acc);
    if (this._dest.gravitate) {
      this._vel.x = (this._dest.x - this._pos.x - this._dim.width/2)/this._dest.speed;
      this._vel.y = (this._dest.y - this._pos.y - this._dim.height/2)/this._dest.speed;
      if (this._pos.x === this._dest.x) this._dest.gravitate = false;
    }
  }
  
  gravitateTo(x, y, speed = 10) {
    this._dest = { x, y, gravitate: true, speed: 50/speed};
    
    return this;
  }
  
  addVectors(posX, posY, velX=0, velY=0, accX=0, accY=0) {
    this._pos.addTo({ x: posX, y: posY });
    this._vel.addTo({ x: velX, y: velY });
    this._acc.addTo({ x: accX, y: accY });
    
    return this;
  }

  changeColor(color) {
    this._col = color || NUDGE.randColor();

    return this;
  }
  
  isColliding(name, shape) {
    if (name === 'point') {
      return NUDGE.isBtwn(shape.x, this._pos.x, this._pos.x + this._dim.width) && NUDGE.isBtwn(shape.y, this._pos.y, this._pos.y + this._dim.height);
    } else if (name === 'circle') {
      //circle collision is expensive, so check if box collision works first
      if (this.isColliding('box', shape)) {
        const dx = shape.x - Math.min(this.x, Math.min(shape.x, this._pos.x + this._dim.width));
        const dy = shape._pos.y - Math.min(this._pos.y, Math.min(shape._pos.y, this._pos.y + this._dim.height));
        return dx**2 + dy**2 < shape.radius**2;
      }
    } else if (name === 'box') {
      //lower bounds can be this._dim.width or this._pos.x, it gets the same result
      //the latter is just more confusing and changes based on movement. No change in preformance
      return (
        NUDGE.isBtwn(this._pos.x, shape.x - this._dim.width, shape.x + shape.width) &&
        NUDGE.isBtwn(this._pos.y, shape.y - this._dim.height, shape.y + shape.height) 
      );
    } else if (name === 'bounds') {
      return !NUDGE.isBtwn(this._pos.x, shape[0], shape[2] - this._dim.width) || !NUDGE.isBtwn(this._pos.y, shape[1], shape[3] - this._dim.height);
    }
    //TODO: add polygon class and collision checker
    return false;
  }
  
  get width() { return this._dim.width; };
  get height() { return this._dim.height; };
  set width(num) { this._dim.width = num; };
  set height(num) { this._dim.height = num; };
  
  get x() { return this._pos.x; };
  get y() { return this._pos.y; };
  set x(num) { this._pos.x = num; };
  set y(num) { this._pos.y = num; };
  
  get velX() { return this._vel.x; };
  get velY() { return this._vel.y; };
  set velX(num) { this._vel.x = num; };
  set velY(num) { this._vel.y = num; };
  
  get accX() { return this._acc.x; };
  get accY() { return this._acc.y; };
  set accX(num) { this._acc.x = num; };
  set accY(num) { this._acc.y = num; };
}

//==============================================
//---------START BOX CLASS----------------------
//==============================================

NUDGE.Vector = class {
  constructor(x = 0, y = 0) {
    this._pos = { x, y }
  }

  get y() {return this._pos.y;}
  get x() {return this._pos.x;}
  set y(num) {this._pos.y = num;}
  set x(num) {this._pos.x = num;}

  set angle(angle) {
    const length = Math.sqrt(this._pos.x**2 + this._pos.y**2)
    this._pos.x = Math.cos(angle) * length;
    this._pos.x = Math.sin(angle) * length;
  }

  get angle() {return Math.atan2(this._pos.x, this._pos.y);}

  set length(length) {
    const angle = this.angle;
    this._pos.x = Math.cos(angle) * length;
    this._pos.y = Math.sin(angle) * length;
  }

  get length() {return Math.sqrt(this._pos.x**2 + this._pos.y**2);}

  add(v2) {return new NUDGE.vector(this._pos.x + v2.x, this._pos.y + v2.y);}
  subtract(v2) {return new NUDGE.vector(this._pos.x - v2.x, this._pos.y - v2.y);}
  multiply(val) {return new NUDGE.vector(this._pos.x * val, this._pos.y * val);}
  divide(val) {return new NUDGE.vector(this._pos.x/val, this._pos.y/val);}

  addTo(v2) {
    this._pos.x += v2.x;
    this._pos.y += v2.y;
  }
  
  subtract(v2) {
    this._pos.x -= v2.x;
    this._pos.y -= v2.y;
  }
  
  multiply(val) {
    this._pos.x *= v2.x;
    this._pos.y *= v2.y;
  }
  
  divide(val) {
    this._pos.x /= v2.x;
    this._pos.y /= v2.y;
  }
}


//TODO: probably use Object.freeze() on itself so that properties can't be changed/added/deleted.
//this would stop people from accidentally making a new property instead of using a setter