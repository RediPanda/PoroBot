import * as Canvas from 'canvas';
import { Logger, LoggerType } from '../IO/Logger';

export interface Position {
    x: number;
    y: number;
}

export interface TrianglePosition {
    a: Position;
    b: Position;
    c: Position;
}

export interface Size {
    length: number;
    width: number;
    diameter?: number;
}

export interface ShapeOptions {
    fill?: boolean;
    color?: string; // HEX only. (*# not needed.)
}

export interface StrokeOptions {
    width: string;
}

/**
 * @class
 * @description A class responsible for handling graphical manipulations via buffers.
 */
export class Drawable {
    private board: Canvas.Canvas; // The board of the Drawable context.
    private draw: Canvas.NodeCanvasRenderingContext2D; // The stroke and tool for drawing onto the board.
    private debug: Logger // Logging instance of the Drawable class.
    private points: Array<Position> // Collection of points for the stroke tool.

    constructor(length: number, width: number) {
        // Create canvas board of size.
        this.board = Canvas.createCanvas(length, width);
        this.draw = this.board.getContext('2d');
        this.debug = new Logger('Canvas (Draw)');
        this.points = [];

        this.debug.log(LoggerType.DEBUG, `Instantiating the Draw Driver of size ${length} x ${width}`);
    }

    // Shapes
    addBox(position: Position, size: Size, options?: ShapeOptions): Drawable {
        options?.color ? this.draw.fillStyle = `#${options?.color}` : "#000000";

        options?.fill
            ? this.draw.fillRect(position.x, position.y, size.width, size.length)
            : this.draw.rect(position.x, position.y, size.width, size.length)

        return this;
    }

    addCircle(position: Position, size: Size): Drawable {
        this.draw.beginPath();

        this.draw.arc(position.x, position.y, (size?.diameter || 2)/2, 0, Math.PI * 2);

        return this;
    }

    addTriangle(position: TrianglePosition, size: Size): Drawable {
        // To do: Draw and fill trangle shape/

        return this;
    }

    // Stroke tool.
    addPoint(pos: Position): Drawable{
        // Add stroke point.

        return this;
    }

    doStroke(options: StrokeOptions): Drawable {
        // Perform strokes based on points.

        return this;
    }

    // Rendering.
    render(): Buffer {
        return this.board.toBuffer();
    }
}