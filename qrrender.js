function Point(x,y) {
    this.x = x;
    this.y = y;
}

function qrCode(size,value=null) {
    var array = new Array(size);
    for(var j=0;j<size;++j) {
        var row = new Array(size);
        for(var i=0;i<size;++i) {
            if(value===null) row[i] = Math.random()<0.5; else row[i] = value;
        }
        array[j] = row;
    }
    
    return array;
}

function createNullArray(size) {
    var array = new Array(size);
    for(var j=0;j<size;++j) {
        var row = new Array(size);
        for(var i=0;i<size;++i) row[i] = 0;
        array[j] = row;
    }
    return array;
}

function Turtle(code,used,x,y,inverse=false) {
    var x0 = x;
    var y0 = y;
    
    var dx = 1;
    var dy = 0;
    
    var size = code.length;
    
    this.path = [new Point(x,y)]; // Dies ist der Punkt unten links der Kröte
    
    function ok(x,y) {
        return x>=0 && y>=0 && x<size && y<size && (code[y][x]^inverse);
    }
    
    function turnLeft() {
        var h = dx;
        dx = dy;
        dy = -h;
    }
    
    function turnRight() {
        var h = dx;
        dx = -dy;
        dy = h;
    }
    
    this.step = function() {
    
        if(inverse) {
            if(dy<0) used[y][x-1] |= 2;
            if(dy>0) used[y][x+1] |= 1;
        } else {
            if(dy<0) used[y][x] |= 1; // linke Kante
            if(dy>0) used[y][x] |= 2; // rechte Kante
        }
        //console.log("step",x,y,used[y][x])
        if(!ok(x+dx,y+dy)) {
            // Sackgasse. Im Uhrzeigersinn drehen (auf der Stelle bleiben)
            turnRight();
            this.path.push(new Point(x+(1-dx+dy)/2,y+(1-dx-dy)/2));
        } else if(!ok(x+dx+dy,y-dx+dy)) {
            // Geradeaus.
            x += dx;
            y += dy;
        } else {
            // Wir können nach links abbiegen
            x += dx+dy;
            y += dy-dx;
            turnLeft();
            this.path.push(new Point(x+(1-dx+dy)/2,y+(1-dx-dy)/2));
        }
        
        return x==x0 && y==y0 && dx==1; // Wieder bei Startposition ?
    }
    
    this.go = function() {
        while(!this.step());
    }
    
    this.render = function(ctx,width,height) {
        var scaleX = (width-100)/size;
        var scaleY = (height-100)/size;
        
        ctx.moveTo(50+this.path[0].x*scaleX,50+this.path[0].y*scaleY);
        if(inverse) {
            for(var i=this.path.length-2;i>0;--i) ctx.lineTo(50+this.path[i].x*scaleX,50+this.path[i].y*scaleY);
        } else {
            for(var i=1;i<this.path.length-1;++i) ctx.lineTo(50+this.path[i].x*scaleX,50+this.path[i].y*scaleY);
        }
        ctx.closePath();
    }
}

function logBorder(border) {
    for(var j=0;j<border.length;++j) {
        var row = border[j];
        var str = "";
        for(var i=0;i<row.length;++i) {
            switch(row[i]) {
                case 0: str += ' ';break;
                case 1: str += '<';break;
                case 2: str += '>';break;
                case 3: str += 'x';break;
                default: str+='!';
            }
        }
        console.log(str);
    }
}

function draw(code) {
    var size = code.length
    var border = createNullArray(code.length);

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "rgb(102, 204, 0)";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0, 50, 200)";

    var count = 0;
    for(var j=0;j<size;++j) {
        var inside = false;
        for(var i=0;i<size;++i) {
        
            var c = code[j][i];
            var b = border[j][i];
            if(inside) {
                
                if(c) {
                
                    if( (b&2) != 0) inside = false;
                
                } else {
                
                    var turtle = new Turtle(code,border,i,j,true);
                    turtle.go();
                    if(!count) ctx.beginPath();
                    turtle.render(ctx,500,500);
                    if(border[j][i-1] == 2) {
                        inside = false;
                    }
                    
                    ++count;
                
                }
                
            } else {
                
                if(c) {
                    
                    if(b==1) {
                        inside = true;
                    } else if(b==0) {
                        var turtle = new Turtle(code,border,i,j);
                        turtle.go();
                        if(!count) ctx.beginPath();
                        turtle.render(ctx,500,500);
                        if(border[j][i] == 1) {
                            inside = true;
                        }
                        
                        ++count;
                    }
                    
                }
                
            }
        
        }
    }
    
    if(count>0) {
        ctx.fill("nonzero");
        ctx.stroke();
    }
}

code = null;

function setup() {
    var canvas = document.getElementById("canvas");
    canvas.onmousedown = canvasMouseDown;
    main();
}

function main(value=null) {
    code = qrCode(20,value);
    
    draw(code);
}

function canvasMouseDown(ev) {
    var x = ev.clientX-ev.target.offsetLeft;
    var y = ev.clientY-ev.target.offsetTop;
    
    var scaleX = (canvas.width-100)/code.length;
    var scaleY = (canvas.height-100)/code.length;
    x = Math.floor((x-50)/scaleX);
    y = Math.floor((y-50)/scaleY);
    
    if(x<0 || y<0 || x>=code.length || y>=code.length) return;
    
    code[y][x] = !code[y][x];
    draw(code);
}

