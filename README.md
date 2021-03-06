# Webpage metadata Scrapper

WebPage Metadata scrapper will fetch the Open Graph Parameter from any webpages. Pass the url of a webpage, webpagemetadata scrapper will look for Open Graph paramters in given webpage and parse the response. If no OGP configured in a webpage , it will parse with tags of most common property like title, description and image.
Caching strategy is used for performance improvement. When a website is invoked for n times, it will be cached in dynamoDB, 'n' is configurable. There is also a flag to decide response source either from webpage or from cache.

## Steps to start the application
Install the depedencies for the application 

```
    npm install
```

After successfull installation start the server with below command

```
  npm start
```

## Get Metadata of a Webpage

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
## Application Configuration

Config file has the port and other configurations required for the application

```
    serverport      - application server port
    dynamoDBConfig  - table name
    cacheCount      - If urls invoked these many times , it will be cached and fetched directly from cache
    ogpMetadataMapping- response object mapping
```

## Unit test

Command to run the unit testcases 

```
    npm test
```
