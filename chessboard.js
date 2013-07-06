/*
	Copyright (c) 2013 Bastien Clément

	Permission is hereby granted, free of charge, to any person obtaining a
	copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var use_cache = true;

var app    = require("express")();
var http   = require("http");
var server = http.createServer(app).listen(3129);
var io     = require("socket.io").listen(server, { log: false })
var fs     = require("fs");

var body = false;
function get_body() {
	if(!body || !use_cache) {
		body = fs.readFileSync("chessboard.html", { encoding: "utf8" })
	}
	
	return body;
}

app.get("/", function(req, res) {
	res.setHeader("Content-Type", "text/html; charset=utf-8");
	res.end(get_body());
});

console.log("Listening on port 3129");

var state = {
	white_king0:   [4, 7],
	white_queen0:  [3, 7],
	white_rook0:   [0, 7],
	white_rook1:   [7, 7],
	white_bishop0: [2, 7],
	white_bishop1: [5, 7],
	white_knight0: [1, 7],
	white_knight1: [6, 7],
	white_pawn0:   [0, 6],
	white_pawn1:   [1, 6],
	white_pawn2:   [2, 6],
	white_pawn3:   [3, 6],
	white_pawn4:   [4, 6],
	white_pawn5:   [5, 6],
	white_pawn6:   [6, 6],
	white_pawn7:   [7, 6],
	black_king0:   [4, 0],
	black_queen0:  [3, 0],
	black_rook0:   [0, 0],
	black_rook1:   [7, 0],
	black_bishop0: [2, 0],
	black_bishop1: [5, 0],
	black_knight0: [1, 0],
	black_knight1: [6, 0],
	black_pawn0:   [0, 1],
	black_pawn1:   [1, 1],
	black_pawn2:   [2, 1],
	black_pawn3:   [3, 1],
	black_pawn4:   [4, 1],
	black_pawn5:   [5, 1],
	black_pawn6:   [6, 1],
	black_pawn7:   [7, 1],
};

io.sockets.on("connection", function (socket) {
	socket.on("MOVE", function(id, x, y) {
		socket.broadcast.emit("MOVE", id, x, y);
	});
	
	socket.on("PLACE", function(id, x, y) {
		state[id] = (x > -1) ? [x, y] : false;
		socket.broadcast.emit("PLACE", id, x, y);
	});
	
	socket.emit("RESET");
	
	for(var piece in state) {
		var l = state[piece];
		if(l) {
			socket.emit("PLACE", piece, l[0], l[1]);
		}
	}
	
	socket.emit("SYNC");
});

