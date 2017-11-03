# eyeStorm-nodeJS

<h1>Background</h1>
<p>I created this project for my school's newspaper. It is built using full stack JavaScript
(with react, express, graphql, and mysql). This project has a twin written
in php called eyeStorm if anyone is curious (which is no longer actively maintained)</p>

<h1>About - Simple Version</h1>
<p>This is a newspaper site. Simply put, one can create an account, publish articles, and eventually have it world viewable.</p>

<h1>About - In Depth</h1>

<h2>Types of users</h2>
<p>In this site there are 4 types of users. Note that each type of user can do at least that of the user before it.
<ol>
    <li>
      <details>
        <summary>Random, not logged in users</summary>
        <ul>
          <li>Can view all articles in world viewable issues</li>
          <li>Can see basic info about all users (name, articles created, views)</li>
          <li>Can view individual users' profiles</li>
        </ul>
    </li>
    <li>
      <details>
        <summary>Level 1 users</summary>
          <ul>
              <li>Can create articles</li>
              <li>View all articles whether world-viewable or not</li>
              <li>Delete their own articles</li>
              <li>Edit their own articles <u>until it becomes world-viewable</u></li>
              <li>Delete their own account</li>
              <li>Manage notification settings</li>
              <li>Toggle two factor authentication</li>
              <li>Change their password</li>
          </ul>
        </details>
    </li>
    <li>
      <details>
        <summary>Level 2 users</summary>
          <ul>
              <li>Can delete users less than themselves</li>
              <li>Create other users of the same level</li>
          </ul>
      </details>
    </li>
    <li>
      <details>
        <summary>Level 3 users</summary>
          <ul>
              <li>Can make issues world-viewable (more on that in a bit)</li>
              <li>Give an issue a name (until it becomes world viewable)</li>
              <li>Delete any article</li>
              <li>Change the order articles display on the home page</li>
              <li>Update an article's tags</li>
              <li>Edit any article even after it becomes world-viewable</li>
              <li>Edit the mission statement</li>
          </ul>
      </details>
    </li>
</ol>

<h2>Publishing - From start to end</h2>
<ol>
    <li>
        <details>
            <summary>Logged in user goes to /publish, fills out the form</summary>
            <p>
              An email goes out to all level 3 users who have notifications enabled that an article was created <br />
               At this point, even if the user is level 1, they can edit it <br />
               At any point from here on the creator or level 3 users can delete it</p>
        </details>
    </li>
    <li>
        <details>
            <summary>After a few articles have been uploaded, it's time to make it world viewable, and publish the issue. To do this, a level 3 user goes to /issue, gives the issue a name and toggles the "Published" table cell to "Yes", and submits the form</summary>
            <p>At this point, only level 3 users can edit the article, although the both the owner and level 3s can still delete articles <br />The issue name is now permanent, and the issue cannot be set to private again</p>
        </details>
    </li>
    <li>Done.</li>
</ol>

<ul>
    <li>Comments must be at least 5 characters long</li>
    <li>Can only comment on public articles </li>
    <li>Views only increment when not logged in, and when viewing public articles</li>

<h1>Build Instructions</h1>

<h3>Installation</h3>
<ol>
    <li><code>git clone https://github.com/DovidM/eyeStorm-nodeJS.git</code></li>
    <li><code>cd eyeStorm-nodeJS</code></li>
</ol>


<h3 id="configFile">Config File</h3>

<p>Create a file called <code>config.ts</code> in <code>backend/</code></p>
<pre>
     export default {
        "DB": {
            "HOST": your_server_host,
            "PORT": port_of_your_mysql_server,
            "USER": your_sql_server_username,
            "PASS": your_sql_server_password,
            "NAME": random_database_name // the actual database will be created in the next step
        },
        "EMAIL": {
            "ADDR": your_email_address,
            "PASS": your_email_password,
            "HOST": your_email_host (something like "smtp.gmail.com"),
            "PORT": your_email_port,
            "NAME": your_email_display_name (what people might see in addition to your email address, usually in angle brackets)
        },
        "JWT": {
            "SECRET": your_strong_secret
        },
        "EMAIL_HOST": "@example.com" // only emails with that host will be allowed to create account. Put "*" to allow all emails
     }
</pre>

<details>
  <summary>Example file</summary>
  <pre>
    export default {
        "DB": {
            "HOST": "localhost",
            "PORT": 8889,
            "USER": "dovidm",
            "PASS": "lhHioh 6eofhw807 oibf oWsdfgw9e iuf",
            "NAME": "newspaper"
        },
        "EMAIL": {
            "ADDR": "me@dovidm.com",
            "PASS": "dsf9nlYsafne h435rpwVab dkls3vbieot h4 lwekbPEfle5afnjklsGdh",
            "HOST": "smtp.dovidm.com",
            "PORT": 587,
            "NAME": "Dovid M"
        },
        "JWT": {
            "SECRET": "dNs;fhdas8FRf093845o sd0eKw034y0 wldkc W sfd"
        },
        "EMAIL_HOST": "@dovidm.com"
    }
  </pre>
</details>


<h3>Firing Up</h3>

<p>You MUST have filled out <code>backend/config.ts</code> before this step</p>

<ol>
    <li>
      <details>
        <summary>
          <code>$ node ./install-all -email your_email -password secure_password</code>
          (note: bcrypt module might cause problems. Rerun the command if that happens and it should work)
        </summary>
        <ul>
          <li>Installs nodejs modules needed for backend and frontend</li>
          <li>Uploads database schema to the database named in config.json</li>
          <li>Creates an account with the username "admin" with the email and password passed in</li>
        </ul>
    </li>
    <li><code>node ./start-all</code> // starts front and backend servers</li>
    <li>Go to <a href="http://localhost:3001">http://localhost:3001</a> in your browser</li>
</ol>


<h1>Database Information</h1>

<p>Note: You don't need to know any of this to use the project</p>

<h3 id="dbUsersInfo">users</h3>
<ul>
    <li><code>username</code>, <code>f_name</code>, <code>m_name</code> (optional), <code>l_name</code> - 1 word</li>
    <li><code>email</code> - must end with <a href="#configFile">config.json</a>'s EMAIL_HOST (or anything, if EMAIL_HOST is '*'</li>
    <li><code>level</code> - 1-3</li>
    <li><code>password</code>, <code>auth</code> - bcrypt hashed</li>
    <li><code>notifications</code>, <code>two_fa_enabled</code> - 1 or 0, default is 1</li>
    <li><code>auth_time</code> - regular old timestamp</li>
</ul>

<h3>pageinfo</h3>
<ul>
    <li><code>created</code> - timestamp when article was created</li>
    <li><code>url</code> - url of where, relative to the root directory, the article with be located</li>
    <li><code>lede</code> - first part of article (title, author, first paragraph), separate from rest to make it easier (and with my limited knowledge I think easier than getting the entire article every time someone goes to the main page (for this is what is viewable on the main page)</li>
    <li><code>img_url</code> - stringified array of all images in the article. The actual <img> src is replaced with data-src</li>
    <li><code>slide_img</code> - stringifed array of 1,0 for whether an image should be in the slideshow shown in the home page. Corresponds with img_url</li>
    <li><code>body</code> - body of article (basically everything in the article except the lede)</li>
    <li><code>issue</code> - issue number, corresponds with <code>issue.num</code></li>
    <li><code>authorid</code> - id of author</li>
    <li><code>views</code> - how many views an article has. This number should not be affected by logged in users viewing articles</li>
    <li><code>display_order</code> - which articles should display where on the home page. Highest number displays first</li>
</ul>

<h3>issues</h3>
<ul>
    <li><code>num</code> - issue number (primary key, autoincremented)</li>
    <li><code>ispublic</code> - boolean if articles in issue are viewable by everyone, or just logged in users</li>
    <li><code>name</code> - name of issue (displayed in home page)</li>
    <li><code>madepub</code> - date the issue was made public</li>
</ul>

<h3>comments</h3>
<ul>
    <li><code>art_id</code> - id of article (foreign key)</li>
    <li><code>authorid</code> - id of author of comment (foreign key)</li>
    <li><code>content</code> - actual comment (html)</li>
    <li><code>created</code> - date comment was posted</li>
</ul>

<h3>tag_list</h3>
<ul>
    <li><code>tag</code> - string. Only entries in here can be used as <code>tag</code> in the <code>tags</code> table</li>
</ul>

<h3>tags</h3>
<ul>
    <li><code>art_id</code> - see comments.art_id</li>
    <li><code>tag</code> - tags of the article</li>
</ul>
