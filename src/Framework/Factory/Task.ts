import type { Client, TextChannel, Webhook } from 'discord.js';
import { Logger, LoggerType } from '../IO/Logger';
import { Storage, StorageType, StorageParam } from '../IO/Storage';
import type Enmap from 'enmap';
import dayjs from 'dayjs';
import IsBetween from 'dayjs/plugin/isBetween';

dayjs.extend(IsBetween);

export class TaskManager {
    client: Client;
    storage: Enmap<string|number, any>;
    logger: Logger;

    constructor(client: Client) {
        this.client = client;
        this.storage = new Storage({server: "0", user: "0"}).select(StorageType.Task).stream(); // Accessing the core methods of Enmap.
        this.logger = new Logger("Task", true)
    }

    // Methods related to obtaining tasks via ID.
    ExistById(id: string): boolean {
        return this.storage.has(id);
    }

    GetById(id: string): Task {
        return new Task(this.storage.get(id));
    }

    DeleteById(id: string): void {
        this.storage.delete(id);
    }

    // Methods related to obtaining data via UserProfile.
    NewTask(taskid: string, userid: string, task: TaskModel): void {
        let buffer = {
            id: taskid,
            ...task,
            target: userid
        }

        this.storage.set(taskid, buffer);
    }

    GetTasks(userid: string): Array<Task> {
        let internal_buffer: Task[] = [];
        let dataArr = this.storage.keyArray();

        // console.log(dataArr)
        for (let i = 0; i < dataArr.length; i++) {
            if (this.GetById(dataArr[i] as string).getOwner() === userid) {
                // console.log("Yay! Owner")
                internal_buffer.push(this.GetById(dataArr[i] as string));
            }
        }

        return internal_buffer;
    }

    GetTasksInOneWeek(userid: string): Array<Task> {
        let internal_buffer: Task[] = [];
        let dataArr = this.GetTasks(userid);

        for (let i = 0; i < dataArr.length; i++) {
            if (dataArr[i].isDueThisWeek()) {
                internal_buffer.push(dataArr[i]);
            }
        }

        return internal_buffer;
    }

    GetTasksInTwoWeek(userid: string): Array<Task> {
        let internal_buffer: Task[] = [];
        let dataArr = this.GetTasks(userid);

        for (let i = 0; i < dataArr.length; i++) {
            if (dataArr[i].isDueInTwoWeek()) {
                internal_buffer.push(dataArr[i]);
            }
        }

        return internal_buffer;
    }

    // Systematic methods only runnable by the system.
    RunCocoaLoop(client: Client): void {
        // This system is responsible for cleanup on stagnant tasks/(overdue).
    }
}

export class Task {
    data: TaskModel
    storage: Enmap

    constructor(data: TaskModel) {
        this.data = data;
        this.storage = new Storage({server: "0", user: "0"}).select(StorageType.Task).stream(); // Accessing the core methods of Enmap.
    }

    getId(): string {
        return this.data?.id || "Task_No_ID";
    }

    getName(): string {
        return this.data.name;
    }

    getOwner(): string {
        return this.data?.target || "Unassigned";
    }

    getDueDate(): Date {
        return this.data?.dueDate || new Date("2025-12-25");
    }

    getType(): string {
        return this.data.type;
    }

    getClassId(): string {
        return this.data.classId;
    }

    getSubmitLink(): string {
        return this.data.submitLink;
    }

    setSubmitLink(url: string): void {
        this.storage.set(this.data.id as string, url, "submitLink");
    }

    getRubricLink(): string {
        return this.data.rubricLink;
    }

    setRubricLink(url: string): void {
        this.storage.set(this.data.id as string, url, "rubricLink");
    }

    getActiveState(): ActiveState {
        return this.data.activeState;
    }

    setDueDate(date: Date): void {
        this.storage.set(this.data.id as string, date, "dueDate");
    }

    setActiveState(newState: ActiveState): void {
        this.storage.set(this.data.id as string, newState, "activeState");
    }

    isDueThisWeek(): boolean {
        let startWeek = dayjs().startOf("week");
        let endWeek = dayjs().endOf("week");

        // console.log(startWeek.format())
        // console.log(endWeek.format())

        return dayjs(this.getDueDate()).isBetween(startWeek, endWeek);
    }

    isDueInTwoWeek(): boolean {
        let startWeek = dayjs().add(1, "week").startOf("week");
        let endWeek = dayjs().add(1, "week").endOf("week");

        // console.log(startWeek.format())
        // console.log(endWeek.format())

        return this.isDueThisWeek() || dayjs(this.getDueDate()).isBetween(startWeek, endWeek);
    }
}

export interface TaskModel {
    id?: string,
    target?: string, // Target - The person the task is owned by.
    name: string, // The name of the task.
    type: string, // Custom type by the user.
    classId: string,
    dueDate?: Date,
    activeState: ActiveState; // This number will represent some enums.
    submitLink: string, // The primary link to submission.
    rubricLink: string, // Any other tertiary link works here.
}

export enum ActiveState {
    PENDING = "PENDING",
    ONGOING = "ONGOING",
    REVIEW = "REVIEW",
    SUBMITTED = "SUBMITTED",
    OVERDUE = "OVERDUE"
}