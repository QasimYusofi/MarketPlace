Post sample to create user:
- POST  :8000/api/users/
- body
  { 
    "first_name": "Qasim", 
    "last_name": "Yusofi", 
    "phone": "09926067529", 
    "password": "StrongPass@123", 
    "email": "qasim@gmail.com", 
    "post_code": "1234567890", "
    birthday": "2001-04-25", 
    "city": "Tehran" 
  }


Get to auth fetch data
- POST:8000/api/auth/token/
- body
  {
    "phone":"09926067529" ,"password"="StrongPass@123"
  } 

then get the access token
- GET:8000/api/users/690ce0b2345b9c083b0b0aa3 (id)
- past access token in auth bearer token
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYyNDU2ODMyLCJpYXQiOjE3NjI0NTMyMzIsImp0aSI6IjIzN2ZiNWRkMThhYTQ0ZDE5ZDk1Y2Q0ZDJiY2QyMzMzIiwidXNlcl9pZCI6IjY5MGNlMGIyMzQ1YjljMDgzYjBiMGFhMyJ9.31dqLjcBi37j6q74E3e1z_FJFYiKRvR26h1ay0IWYGw