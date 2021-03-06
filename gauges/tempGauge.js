"use strict";
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");

    let cHeight = canvas.height;
    let cWidth = canvas.width;
    let radius = 0.0;               // middle radius of the arcs
    let arcThick = 0.0;             // arc thickness
    if (cHeight <= cWidth * 6/10) {
        radius = Math.floor(cHeight * 4/6);
        arcThick = Math.floor(cHeight/6);
        ctx.translate(cWidth/2, cHeight * 7/8);
    } else { 
        radius = Math.floor(cWidth * 2/6);
        arcThick = Math.floor(cWidth/12); 
        ctx.translate(cWidth/2, cHeight * 3/4);
    }

    console.log("Height: ", cHeight, " Width: ", cWidth);

    class gauge {
        
        static step = 0;
        static dir = 1;

        constructor(maxTemp, size) {
            this.maxTemp = maxTemp;                       
            this.rad = size;              // outside radius in px    
        }

        drawGauge(temp) {
            ctx.fillStyle = "darkgrey";
            ctx.clearRect(-120, -140 /* -cWidth/2, -cHeight * 7/8 */, cWidth/2, cHeight/8);
            this.drawNumbers(ctx, radius)
            this.drawDial();
            

            if (temp >= 0 && temp <= 40) {
                this.drawNeedle(ctx, temp, radius, radius/15);
                this.tempArc(temp);
            } else alert("Temperature value out of range!");

            this.printTemp(temp);
        }
        
        drawDial() {
            ctx.beginPath();        // The white dial (background)
            ctx.arc(0, 0, radius + arcThick/2, Math.PI * 0.99, 2.01 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            
            ctx.beginPath();            // The grey beem beneath the dial
            ctx.lineWidth = Math.ceil(radius/10);
            ctx.strokeStyle = '#8a8a8a'
            ctx.moveTo( -(radius + arcThick/2), radius/20);   
            ctx.lineTo((radius + arcThick/2), radius/20 ); 
            ctx.stroke();  
            
            ctx.fillStyle = '#8a8a8a';
            ctx.beginPath();            // The circle beneath the grey beem
            ctx.arc(0, 0, 23, 0, 1 * Math.PI);
            ctx.fill();

            ctx.lineWidth = Math.floor( radius/4 ); // Big grey arc
            ctx.strokeStyle = '#bbb'; //"lightgrey";
            ctx.beginPath();
            ctx.arc(0, 0, radius, Math.PI, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();            // The grey beem beneath the dial
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#8a8a8a'

            for (let i = 0; i < 9; i++) {
                ctx.moveTo( -(radius - arcThick/2), 0);   
                ctx.lineTo( -(radius + arcThick/2 + 8), 0 ); 
                ctx.stroke(); 
                ctx.rotate(22.5 * Math.PI / 180);
            }
            /*
            ctx.moveTo( -(radius + arcThick/2), 0);   
            ctx.lineTo( -(radius + arcThick/2 + 7), 0 ); 
            ctx.stroke();*/
            ctx.rotate(- 22.5 * 9 * Math.PI / 180);            
        }

        drawNumbers(ctx, radius) {
            var ang;
            var num;
            ctx.font = /* "normal " + */ Math.floor(radius * 0.2) + "px Arial";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
                        
            for(num = 0; num < 9; num++){
                
                ang = num * Math.PI / 8 - Math.PI / 2;
                ctx.rotate(ang);
                ctx.translate(0, - Math.floor(radius * 1.37) );
                ctx.clearRect(0, 0, 50, 50);
                ctx.rotate(-ang);

                ctx.fillStyle = "black";
                ctx.fillText((num * 5).toString(), 0, 0);
                ctx.rotate(ang);
                ctx.translate(0, Math.floor(radius * 1.37) );
                ctx.rotate(-ang);
            }
        }

        drawNeedle(ctx, temp, length, width) {

            let needleAngle = temp * Math.PI/40;

            ctx.lineWidth = width;
            ctx.strokeStyle = '#080808';
            ctx.lineCap = "round";

            /* ** blunt line needle **
            ctx.beginPath();
            ctx.moveTo( 0, 0);    // 0 if a full needle is needed
            ctx.rotate(needleAngle);
            ctx.lineTo(-radius * 0.8, 0 ); 
            ctx.stroke();
            ctx.rotate(-needleAngle);*/

            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo( 0, 0);
            ctx.rotate(needleAngle);
            ctx.moveTo(20, 4);            
            ctx.lineTo(-radius * 0.8, 0);            
            ctx.lineTo(20, -4);
            ctx.closePath();            

            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.stroke();
            ctx.rotate(-needleAngle);
        }

        printTemp(temp) {            
            let textX = - Math.floor( radius * 0.45 );         // text X-coordinate 
            let textY = Math.floor( radius * 0.2 ); // 13;    // text Y-coordinate (80% of Ymax)
            if( temp < 10.0 ) textX += Math.floor( radius * 0.17 ); // 

            ctx.fillStyle = '#eee';
            ctx.lineWidth = 2;
            roundRect(ctx, - 38, -10, 74, 24, 8, true);

            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
            ctx.fillStyle = "black";
            ctx.font = "bold " + Math.floor( radius * 0.3 ) + "px Arial"; 
            ctx.fillText(temp.toFixed(1) + "\??C", textX, textY);
        }

        tempArc(temp = 22) {

            let colorChangeTemp = {
                "start": 0, 
                "darkblue": 5, 
                "blue": 16, 
                "green": 22, 
                "yellow": 26,   
                "red": 100
            }; // 0-5?? - dark blue, 5-16?? - blue, 16-22?? - green, 22-26?? yellow, > 26?? - red            
            
            let begAngle = 0.0;
            let endAngle = 120.0;
            let zone = 1; 

            if (temp < 5) zone = 1;
            else if (temp >= 5 && temp < 16) zone = 2;
            else if (temp >= 16 && temp < 22) zone = 3;
            else if (temp >= 22 && temp < 25) zone = 4;
            else zone = 5;     

            switch(zone) {
                case 5:
                    begAngle = 4.5 * colorChangeTemp["yellow"]; // 112.5;
                    endAngle = 4.5 * temp;
                    this.strokeArc("red", begAngle, endAngle);
                case 4:
                    begAngle = 4.5 * colorChangeTemp["green"]; // 99
                    if (zone > 4) endAngle = 4.5 * colorChangeTemp["yellow"]; else endAngle = 4.5 * temp;
                    this.strokeArc("yellow", begAngle, endAngle);
                case 3:
                    begAngle = 4.5 * colorChangeTemp["blue"]; // 72
                    if (zone > 3) endAngle = 4.5 * colorChangeTemp["green"]; else endAngle = 4.5 * temp;
                    this.strokeArc("green", begAngle, endAngle);
                case 2:
                    begAngle = 4.5 * colorChangeTemp["darkblue"]; // 31.5
                    if (zone > 2) endAngle = 4.5 * colorChangeTemp["blue"]; else endAngle = 4.5 * temp;
                    this.strokeArc("blue", begAngle, endAngle);
                case 1: 
                    begAngle = 4.5 * colorChangeTemp["start"];
                    if (zone > 1) endAngle = 4.5 * colorChangeTemp["darkblue"]; else endAngle = 4.5 * temp;
                    this.strokeArc("darkblue", begAngle, endAngle);                    
                    break;
            }           
        }

        strokeArc(arcColor, begA, endA){
            
            ctx.lineWidth = Math.floor( radius/4 ); // 10;
            ctx.lineCap = "butt";          // butt (Default), round, square
            ctx.strokeStyle = arcColor;
            ctx.beginPath();
            ctx.arc(0, 0, radius, (180 + begA) * Math.PI/180, (180 + endA) * Math.PI/180);
            ctx.stroke();
        }

    } // End 'class gauge'
  
    const gauge1 = new gauge(40, radius);

    setInterval(arc, 500);   

    function arc() {
        let temp = 3.07 * gauge.step;
        
        gauge.step += gauge.dir;
        if (gauge.step == 13)     gauge.dir = -1;
        else if (gauge.step == 0) gauge.dir = 1;
        console.log(temp.toFixed(1));
        
        gauge1.drawGauge(temp);
    }
    
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}