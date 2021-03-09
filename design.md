----------
2 per row
----------

{if content[1].price!=(int(content[1].vars.retail))}
  {content[1].images.email_290x290.url}
{else}
  {content[1].images.email_290x290_clean.url}{/if}


width="365"

----------
3 per row
----------
  {if content[3].price!=(int(content[3].vars.retail))}
    {content[3].images.email_290x290.url}
{else}
{content[3].images.email_290x290_clean.url}{/if}

width="240"


Objectives
1. Get the same size pink savings badge - 
  this is either the same proportions as the two colum, or the same as the old newsletter (invetsigate)
2. Margins with rands can get too small and squashed in case of too many chars, reduce.




check the image processing logs for email_290x290 for the image url that is passed

-- maybe we need to create two images for this, not quite 290x290 but something else. 

-- think maybe we design one that is 240, and another that is 365 for instance. 

need to replace that 2020 with 2021 below.

----------------------------------------------------------------------------------------------------

06:23:14.791 GMT - INFO:  GCP upload image request for 529429.email_290x290.460804.jpg
06:23:19.189 GMT - INFO:  GCP upload image SUCCESS for https://cdn.onedayonly.co.za/mailers/2020/529429.email_290x290.460804.jpg
06:23:19.193 GMT - INFO:  Deleted processed image ./assets/529429.email_290x290.460804.jpg
06:23:41.334 GMT - INFO:  channel image-request consumer received message:  {"productId":"529431","type":"email_290x290","random":841442,"url":"https://cdni.onedayonly.co.za/catalog/product/161/397/1613974954.4587.jpeg?h=290&w=290&bg=fff&fit=fill","savings":"34%","pill":"","isBestSeller":false,"priority":7,"hasLunch":false,"isLandscape":false}.


0

1 2 (added these _small to the 290x290)
3 4 5
6 7 8
9 10 (added these _small to the 290x290)
11 12 13
14 15 16


https://cdn.onedayonly.co.za/mailers/2020/529637.email_290x290_small.220763.jpg
https://cdn.onedayonly.co.za/mailers/2020/529637.email_290x290.220763.jpg