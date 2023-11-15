import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { HTTP_STATUS } from "./utils/http-status-code.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title)
        return res
          .writeHead(HTTP_STATUS.BAD_REQUEST)
          .end(JSON.stringify(`Missing 'title' property in the request body.`));

      if (!description)
        return res
          .writeHead(HTTP_STATUS.BAD_REQUEST)
          .end(
            JSON.stringify(
              `Missing 'description' property in the request body.`
            )
          );

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(HTTP_STATUS.CREATED).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!task) {
        return res
          .writeHead(HTTP_STATUS.NOT_FOUND)
          .end(JSON.stringify(`Record with id '${id}' not found.`));
      }

      if (!title && !description)
        return res
          .writeHead(HTTP_STATUS.BAD_REQUEST)
          .end(
            JSON.stringify(
              `Missing 'title' and 'description', should have at least one property in the request body.`
            )
          );

      database.update("tasks", id, {
        ...(title && { title }),
        ...(description && { description }),
      });

      return res.writeHead(HTTP_STATUS.NO_CONTENT).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      if (!task) {
        return res
          .writeHead(HTTP_STATUS.NOT_FOUND)
          .end(JSON.stringify(`Record with id '${id}' not found.`));
      }

      database.delete("tasks", id);

      return res.writeHead(HTTP_STATUS.NO_CONTENT).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const [task] = database.select("tasks", { id });

      if (!task) {
        return res
          .writeHead(HTTP_STATUS.NOT_FOUND)
          .end(JSON.stringify(`Record with id '${id}' not found.`));
      }

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update("tasks", id, { completed_at });
      return res.writeHead(HTTP_STATUS.NO_CONTENT).end();
    },
  },
];
