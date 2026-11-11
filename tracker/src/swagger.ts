import swaggerUi from "swagger-ui-express";
import { Router } from "express";

export const swaggerRouter = Router();

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Bookmark Tracker API",
    version: "1.0.0",
    description: "Production-grade REST API for managing bookmarks, tags, and collections",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          displayName: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Bookmark: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          url: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          favicon: { type: "string", nullable: true },
          isArchived: { type: "boolean" },
          isFavorite: { type: "boolean" },
          clickCount: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          tags: { type: "array", items: { $ref: "#/components/schemas/Tag" } },
        },
      },
      Tag: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          name: { type: "string" },
          color: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Collection: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          isPublic: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    timestamp: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                  displayName: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "integer" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          "409": { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "integer" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/bookmarks": {
      get: {
        summary: "List bookmarks",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": {
            description: "Paginated bookmarks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Bookmark" } },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create bookmark",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  tagIds: { type: "array", items: { type: "integer" } },
                  collectionIds: { type: "array", items: { type: "integer" } },
                },
                required: ["url", "title"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Bookmark" } } } },
          "400": { description: "Validation error" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/bookmarks/search": {
      get: {
        summary: "Search bookmarks",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "tagId", in: "query", schema: { type: "integer" } },
          { name: "isArchived", in: "query", schema: { type: "boolean" } },
          { name: "isFavorite", in: "query", schema: { type: "boolean" } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "updatedAt", "clickCount", "title"] } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: {
          "200": {
            description: "Search results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Bookmark" } },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/bookmarks/{id}": {
      get: {
        summary: "Get bookmark",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Bookmark found", content: { "application/json": { schema: { $ref: "#/components/schemas/Bookmark" } } } },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
      patch: {
        summary: "Update bookmark",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  isArchived: { type: "boolean" },
                  isFavorite: { type: "boolean" },
                  tagIds: { type: "array", items: { type: "integer" } },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Bookmark" } } } },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
      delete: {
        summary: "Delete bookmark",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/bookmarks/{id}/click": {
      post: {
        summary: "Record bookmark click",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Recorded" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/tags": {
      get: {
        summary: "List tags",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Tags list", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Tag" } } } } } } },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create tag",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  color: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Tag" } } } },
          "409": { description: "Duplicate" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/tags/{id}": {
      delete: {
        summary: "Delete tag",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/collections": {
      get: {
        summary: "List collections",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Collections list", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Collection" } } } } } } },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        summary: "Create collection",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  isPublic: { type: "boolean" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Collection" } } } },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/collections/{id}": {
      get: {
        summary: "Get collection",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Collection found" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
      patch: {
        summary: "Update collection",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  isPublic: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Collection" } } } },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
      delete: {
        summary: "Delete collection",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/collections/{id}/bookmarks/{bookmarkId}": {
      post: {
        summary: "Add bookmark to collection",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "bookmarkId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "204": { description: "Added" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
      delete: {
        summary: "Remove bookmark from collection",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "bookmarkId", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "204": { description: "Removed" },
          "404": { description: "Not found" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/stats": {
      get: {
        summary: "Get user stats",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "User statistics" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/data/export": {
      get: {
        summary: "Export bookmarks",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Bookmarks exported as JSON array" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/data/import": {
      post: {
        summary: "Import bookmarks",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                  },
                  required: ["url", "title"],
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Import results" },
          "400": { description: "Invalid input" },
          "401": { description: "Unauthorized" },
        },
      },
    },
  },
};

swaggerRouter.use("/", swaggerUi.serve);
swaggerRouter.get("/", swaggerUi.setup(spec));
