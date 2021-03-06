import {Game} from './game';
import {b2Vec2} from 'box2d.ts/Box2D/Box2D/Common/b2Math';
import {FinishState, RunningState} from './gameState';
import eventBus from '../eventBus';
/**
 * Created by zwirec on 20.11.17.
 */

export enum Messages {
    BoardMessage = 'BoardMessage',
    MovingMessage = 'MovingMessage',
    SnapMessage = 'SnapMessage',
    StartedMessage = 'StartedMessage',
    SubscribeMessage = 'SubscribeMessage',
    StartMessage = 'StartMessage',
    FinishedMessage = 'FinishedMessage',
}

export abstract class Message {
    protected game: Game;
    protected class: string;

    static Create(game: Game, msg: string): Message {
        let message;
        try {
            message = JSON.parse(msg);
        } catch (err) {
            console.error(err);
            console.log(msg);
            eventBus.emit('game', 'parseFailed', {'msg': 'parseFailed at "CreateMessage"'});
            return;
        }

        if (message && message.class === Messages.MovingMessage) {
            return new MovingMessage(game, message);
        } else if (message && message.class === Messages.BoardMessage) {
            return BoardMessage.fromRecievedData(game, msg);
        } else if (message && message.class === Messages.StartedMessage) {
            return new StartedMessage(game, message);
        } else if (message && message.class === Messages.SnapMessage) {
            return new SnapMessage(game, message);
        } else if (message && message.class === Messages.FinishedMessage) {
            return new FinishedMessage(game, message);
        }
    }

    abstract HandleResponse();

    abstract HandleRequest();

}


export class BoardMessage extends Message {

    static fromRecievedData(game: Game, msg: any): Message {
        let {playerID} = msg;
        return new this(game, playerID);
    }

    private playerID: number;

    constructor(game: Game, playerID: number) {
        super();
        this.game = game;
        this.playerID = playerID;
        this.class = this.constructor.name;
    }

    HandleRequest() {
        throw new Error('Method not implemented.');
    }

    HandleResponse() {
        this.game.playerID = this.playerID;
        console.log('BoardMessage recieve');
    }
}

export class SubscribeMessage extends Message {
    private board: number;
    private message;

    constructor(game: Game, board: number) {
        super();
        this.game = game;
        this.class = this.constructor.name;
        this.board = board;
        this.message = {class: this.class, board: this.board};
    }

    HandleRequest() {
        this.game.gameService.sendSocketMessage(this.message);
    }

    HandleResponse() {

    }
}

interface Snap {
    id: number;
    position: b2Vec2;
    angle: number;
}

export class MovingMessage extends Message {
    private snap: Snap;
    private message: any;
    private playerID: number;


    constructor(game: Game, messageObj: any) {
        super();
        this.game = game;
        this.snap = messageObj.snap;
        this.class = this.constructor.name;
        this.message = {class: this.class, snap: messageObj.snap};
    }

    HandleResponse() {
        this.game.playerID = this.playerID;
        this.game.board.bodies.get(this.snap.id).shapes.set('left', this.snap.position.x);
        this.game.board.bodies.get(this.snap.id).shapes.set('top', this.snap.position.y);
        this.game.board.bodies.get(this.snap.id).shapes.set('angle', this.snap.angle);
        this.game.board.bodies.get(this.snap.id).shapes.setCoords();
        this.game.board.canvas.renderAll();
    }

    HandleRequest() {
        this.game.gameService.sendSocketMessage(this.message);
    }
}

export interface Frame {
    id?: number;
    position?: b2Vec2;
    angle?: number;
    velocity?: b2Vec2;
}

type Frames = Frame[];

export class StartMessage extends Message {
    private frames: Frames = [];

    constructor(game: Game) {
        super();
        this.game = game;
        this.class = this.constructor.name;
    }

    HandleRequest() {
        for (let body of this.game.board.bodies.values()) {
            let frame: Frame = {};
            frame.id = body.ID;
            frame.position = body.pos_in_pixels;
            frame.angle = body.angle;
            this.frames.push(frame);
        }
        let message = {
            class: this.class,
            bodies: this.frames,
        };
        console.log(message);
        this.game.gameService.sendSocketMessage(message);
    }

    HandleResponse() {
    }

}

export class StartedMessage extends Message {

    constructor(game: Game, messageObj: any) {
        super();
        this.game = game;
        this.class = this.constructor.name;
        console.log(messageObj);
    }

    HandleRequest() {

    }

    HandleResponse() {
        this.game.changeState(new RunningState(this.game));
        this.game.start();
    }

}

export class SnapMessage extends Message {
    private message;
    private bodies;
    private frame;

    constructor(game: Game, messageObj: any) {
        super();
        this.game = game;
        this.class = this.constructor.name;
        // console.log(messageObj);
        this.message = messageObj;
        this.bodies = messageObj.bodies;
        this.frame = messageObj.frame;
        this.message.class = this.class;
        this.message.frame = this.frame;
        this.message.bodies = this.bodies;
    }

    HandleRequest() {
        this.game.gameService.sendSocketMessage(this.message);
    }

    HandleResponse() {
        // console.log(this.message);
        for (let body of this.bodies) {
            this.game.board.bodies.get(body.id).body.SetPosition(body.position);
            this.game.board.bodies.get(body.id).body.SetLinearVelocity(body.linVelocity);
            this.game.board.bodies.get(body.id).body.SetAngularVelocity(body.angVelocity);
            this.game._frame = this.frame;
        }
    }

}

export class FinishedMessage extends Message {
    private message;

    constructor(game: Game, messageObj: any) {
        super();
        this.game = game;
        this.class = this.constructor.name;
        this.message = messageObj;
        this.message.class = this.class;
    }

    HandleRequest() {
        throw new Error('method not implemented');
    }

    HandleResponse() {
        console.log(this.message);
        this.game.changeState(new FinishState(this.game));
        this.game.finish(true);
    }

}

export class FinishMessage extends Message {
    private message;

    constructor(game: Game, messageObj: any) {
        super();
        this.game = game;
        this.class = this.constructor.name;
        this.message = messageObj;
        this.message.class = this.class;
    }

    HandleRequest() {
        this.game.gameService.sendSocketMessage(this.message);
    }

    HandleResponse() {
        throw new Error('method not implemented');
    }

}