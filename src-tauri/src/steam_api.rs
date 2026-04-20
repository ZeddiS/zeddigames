use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct SteamProfile {
    pub steam_id: String,
    pub persona_name: String,
    pub avatar_full: String,
    pub profile_url: String,
    pub persona_state: u32,
    pub real_name: Option<String>,
    pub loc_country: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SteamOwnedGame {
    pub appid: u64,
    pub name: Option<String>,
    pub playtime_forever: u64,
    pub img_icon_url: Option<String>,
    pub playtime_2weeks: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SteamFriend {
    pub steam_id: String,
    pub relationship: String,
    pub friend_since: u64,
    // Enriched after second call
    pub persona_name: Option<String>,
    pub avatar_url: Option<String>,
    pub persona_state: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SteamAchievement {
    pub api_name: String,
    pub achieved: u32,
    pub unlock_time: u64,
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SteamNewsItem {
    pub gid: String,
    pub title: String,
    pub url: String,
    pub author: String,
    pub contents: String,
    pub date: u64,
    pub appid: u64,
}

// ─── API Responses ────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct GetPlayerSummariesResponse {
    response: PlayerSummariesInner,
}
#[derive(Deserialize)]
struct PlayerSummariesInner {
    players: Vec<PlayerRaw>,
}
#[derive(Deserialize)]
struct PlayerRaw {
    steamid: String,
    personaname: String,
    avatarfull: String,
    profileurl: String,
    personastate: u32,
    realname: Option<String>,
    loccountrycode: Option<String>,
}

#[derive(Deserialize)]
struct GetOwnedGamesResponse {
    response: OwnedGamesInner,
}
#[derive(Deserialize)]
struct OwnedGamesInner {
    games: Option<Vec<SteamOwnedGame>>,
}

#[derive(Deserialize)]
struct GetFriendListResponse {
    friendslist: FriendListInner,
}
#[derive(Deserialize)]
struct FriendListInner {
    friends: Vec<FriendRaw>,
}
#[derive(Deserialize)]
struct FriendRaw {
    steamid: String,
    relationship: String,
    friend_since: u64,
}

#[derive(Deserialize)]
struct GetPlayerAchievementsResponse {
    playerstats: PlayerStatsInner,
}
#[derive(Deserialize)]
struct PlayerStatsInner {
    achievements: Option<Vec<AchievementRaw>>,
}
#[derive(Deserialize)]
struct AchievementRaw {
    apiname: String,
    achieved: u32,
    unlocktime: u64,
    name: Option<String>,
    description: Option<String>,
}

#[derive(Deserialize)]
struct GetNewsResponse {
    appnews: AppNewsInner,
}
#[derive(Deserialize)]
struct AppNewsInner {
    newsitems: Vec<NewsItemRaw>,
    appid: u64,
}
#[derive(Deserialize)]
struct NewsItemRaw {
    gid: String,
    title: String,
    url: String,
    author: String,
    contents: String,
    date: u64,
}

// ─── API Functions ────────────────────────────────────────────────────────────

pub async fn get_profile(api_key: &str, steam_id: &str) -> Result<SteamProfile, String> {
    let url = format!(
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={}&steamids={}",
        api_key, steam_id
    );
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let data: GetPlayerSummariesResponse = resp.json().await.map_err(|e| e.to_string())?;
    let p = data.response.players.into_iter().next()
        .ok_or("Profil nenalezen")?;

    Ok(SteamProfile {
        steam_id: p.steamid,
        persona_name: p.personaname,
        avatar_full: p.avatarfull,
        profile_url: p.profileurl,
        persona_state: p.personastate,
        real_name: p.realname,
        loc_country: p.loccountrycode,
    })
}

pub async fn get_owned_games(api_key: &str, steam_id: &str) -> Result<Vec<SteamOwnedGame>, String> {
    let url = format!(
        "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key={}&steamid={}&include_appinfo=true&include_played_free_games=true",
        api_key, steam_id
    );
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let data: GetOwnedGamesResponse = resp.json().await.map_err(|e| e.to_string())?;
    Ok(data.response.games.unwrap_or_default())
}

pub async fn get_friends(api_key: &str, steam_id: &str) -> Result<Vec<SteamFriend>, String> {
    let url = format!(
        "https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key={}&steamid={}&relationship=friend",
        api_key, steam_id
    );
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let data: GetFriendListResponse = resp.json().await.map_err(|e| e.to_string())?;

    let mut friends: Vec<SteamFriend> = data.friendslist.friends.into_iter().map(|f| SteamFriend {
        steam_id: f.steamid,
        relationship: f.relationship,
        friend_since: f.friend_since,
        persona_name: None,
        avatar_url: None,
        persona_state: None,
    }).collect();

    // Enrich first 100 friends with profile data
    if !friends.is_empty() {
        let ids: Vec<&str> = friends.iter().take(100).map(|f| f.steam_id.as_str()).collect();
        let ids_str = ids.join(",");
        let profile_url = format!(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={}&steamids={}",
            api_key, ids_str
        );
        if let Ok(resp) = reqwest::get(&profile_url).await {
            if let Ok(data) = resp.json::<GetPlayerSummariesResponse>().await {
                for player in data.response.players {
                    if let Some(f) = friends.iter_mut().find(|f| f.steam_id == player.steamid) {
                        f.persona_name = Some(player.personaname);
                        f.avatar_url = Some(player.avatarfull);
                        f.persona_state = Some(player.personastate);
                    }
                }
            }
        }
    }
    Ok(friends)
}

pub async fn get_achievements(
    api_key: &str, steam_id: &str, app_id: u64,
) -> Result<Vec<SteamAchievement>, String> {
    let url = format!(
        "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key={}&steamid={}&appid={}",
        api_key, steam_id, app_id
    );
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let data: GetPlayerAchievementsResponse = resp.json().await.map_err(|e| e.to_string())?;
    let achievements = data.playerstats.achievements.unwrap_or_default()
        .into_iter().map(|a| SteamAchievement {
            api_name: a.apiname,
            achieved: a.achieved,
            unlock_time: a.unlocktime,
            name: a.name,
            description: a.description,
            icon: None,
        }).collect();
    Ok(achievements)
}

pub async fn get_news(app_id: u64) -> Result<Vec<SteamNewsItem>, String> {
    let url = format!(
        "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid={}&count=10&maxlength=500",
        app_id
    );
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let data: GetNewsResponse = resp.json().await.map_err(|e| e.to_string())?;
    let items = data.appnews.newsitems.into_iter().map(|n| SteamNewsItem {
        gid: n.gid,
        title: n.title,
        url: n.url,
        author: n.author,
        contents: n.contents,
        date: n.date,
        appid: data.appnews.appid,
    }).collect();
    Ok(items)
}

pub fn steam_cover_url(app_id: u64) -> String {
    format!("https://cdn.cloudflare.steamstatic.com/steam/apps/{}/library_600x900.jpg", app_id)
}

pub fn steam_hero_url(app_id: u64) -> String {
    format!("https://cdn.cloudflare.steamstatic.com/steam/apps/{}/library_hero.jpg", app_id)
}

pub fn steam_header_url(app_id: u64) -> String {
    format!("https://cdn.cloudflare.steamstatic.com/steam/apps/{}/header.jpg", app_id)
}
