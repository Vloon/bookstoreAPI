# Bookstore API

This project contains a small Bookstore API. The following actions are possible: 

| Action            | URI              | Request type | Argument location | Arguments required                          | JWT protected |
|:------------------|:-----------------|:-------------|:------------------|:--------------------------------------------|:--------------|
| Registering a user| `/users/register`| POST         | body              | `username`, `password`                      | No            |
| Loggin in         | `/users/login`   | POST         | body              | `username`, `password`                      | No            |
| Adding a book     | `/books`         | POST         | query parameters  | `title`, `author`, `genre`, `yearPublished` | Yes           |
| Finding books     | `/books`         | GET          | query parameters  | `field`, `value`, `filter`                  | Yes           |
| List all books    | `/books`         | GET          | No arguments      | No arguments                                | Yes           |

JWTs are returned in the body on successful login, and must be provided when performing protected actions via Bearer Authentication. 
When finding a book, valid filters are `is` (fields is value) or `contains` (field contains value). 