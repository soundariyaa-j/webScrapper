# Webpage metadata Scrapper

WebPage Metadata scrapper will fetch the Open Graph Parameter from any webpages.

## Steps to start the application
Install the depedencies for the application 

```
    npm install
```

After successfull installation start the server with below command

```
  npm start
```

##Invoke API 

Hit the api  http://${host}:${port}/metadata/page/getinfo with follwing request

```
{
    "url":"https://gaana.com/playlist/tanmay5709-gannacom"
}
```

Response for above request will be similar as mentioned below

```
{
    "siteNamme": "Gaana.com",
    "type": "music.playlist",
    "url": "https://gaana.com/playlist/tanmay5709-gannacom",
    "title": "Playlist ganna .com on Gaana.com",
    "description": "Listen to ganna .com by Gaana User. Also enjoy other Popular songs on your favourite music app Gaana.com",
    "image": [
        "https://a10.gaanacdn.com//images/playlists/47/4591047/4591047.jpg"
    ],
    "audio": [
        "https://gaana.com/playlist/tanmay5709-gannacom"
    ]
}
```
