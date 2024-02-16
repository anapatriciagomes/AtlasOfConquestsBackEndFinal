# Project Management Server

## Routes

### Visited Routes

| Method | Route                   | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| GET    | /api/visited            | Returns all visited countries      |
| GET    | /api/visited/:countryId | Returns a specific visited country |
| POST   | /api/visited            | Adds a new visited country         |
| DELETE | /api/visited/:countryId | Deletes a visited country          |

### Wishlist Routes

| Method | Route                    | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| GET    | /api/wishlist            | Returns all wishlist countries      |
| GET    | /api/wishlist/:countryId | Returns a specific wishlist country |
| POST   | /api/wishlist            | Adds a new wishlist country         |
| DELETE | /api/wishlist/:countryId | Deletes a wishlist country          |

### Auth Routes

| Method | Route               | Description          |
| ------ | ------------------- | -------------------- |
| POST   | /auth/signup        | Creates a new user   |
| POST   | /auth/login         | Logs the user        |
| GET    | /auth/verify        | Verifies the JWT     |
| PUT    | /auth/users/:userId | Change user password |
| DELETE | /auth/users/:userId | Delete user account  |

## Models

### Visited Model

```js
{
  country: String,
  userId: {type: Schema.Types.ObjectId, ref: 'User'}
}
```

### Wishlist Model

```js
{
  country: String,
  userId: {type: Schema.Types.ObjectId, ref: 'User'}
}
```

### User Model

```js
{
  email: String,
  password: String,
}
```
