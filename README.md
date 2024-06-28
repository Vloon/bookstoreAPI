# Bookstore API

This project contains a small Bookstore API. The following actions are possible: 

|Action            | URI              | Request type | Argument location | Arguments required                          | JWT protected |
|:-----------------|:-----------------|:-------------|:------------------|:--------------------------------------------|:--------------|
|Registering a user| `/users/register`| POST         | body              | `username`, `password`                      | No            |
|Loggin in         | `/users/login`   | POST         | body              | `username`, `password`                      | No            |
|Adding a book     | `/books`         | POST         | query parameters  | `title`, `author`, `genre`, `yearPublished` | Yes           |
|Finding a book    | `/books`         | GET          | query parameters  | `field`, `value`, `filter`                  | Yes           |
|List all books    | `/books/all`     | GET          | No arguments      | No arguments                                | Yes           |

The JWTs are returned in the body on successful login, and must be provided when performing protected actions via Bearer Authentication. 