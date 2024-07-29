import { DependencyContainer } from "tsyringe";

import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { VFS } from "@spt/utils/VFS";
import { jsonc } from "jsonc";
import path from "path";

interface ModConfig 
{
    Foregrips: Record<string, ForegripSettings>;
    Bullets: Record<string, BulletSettings>;
    Suppressors: Record<string, SuppressorSettings>;
    Stocks: Record<string, StockSettings>;
    ArmoredMasks: Record<string, ArmoredMaskSettings>;
}

interface ForegripSettings 
{
    Ergonomics: number;
    Recoil: number;
}

interface BulletSettings
{
    Penetration: number;
    Damage: number;
    ammoAccr: number;
    ammoRec: number;
    ArmorDamage: number;
    HeatFactor: number;
    DurabilityBurnModificator: number;
}

interface SuppressorSettings
{
    Accuracy: number;
    Recoil: number;
    Loudness: number;
    Ergonomics: number;
    Velocity: number;
    HeatFactor: number;
    CoolFactor: number;
    DurabilityBurnModificator: number;
}

interface StockSettings 
{
    Ergonomics: number;
    Recoil: number;
}

interface ArmoredMaskSettings
{
    armorClass: number;
    Durability: number;
    MaxDurability: number;
    BlocksHeadwear: boolean;
    armorColliders: string[];
    price: number;
}


class Mod implements IPostDBLoadMod
{
    private modConfig: ModConfig;

    postDBLoad(container: DependencyContainer): void 
    {
        const vfs = container.resolve<VFS>("VFS");
        this.modConfig = jsonc.parse(vfs.readFile(path.resolve(__dirname, "../config/config.jsonc")));

        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get all the in-memory json found in /assets/database
        const tables: IDatabaseTables = databaseServer.getTables();

        // Bridging our config file to the table edits        
        for (const foregripId in this.modConfig.Foregrips) 
        {
            const foregripSettings = this.modConfig.Foregrips[foregripId];

            tables.templates.items[foregripId]._props.Ergonomics = foregripSettings.Ergonomics;
            tables.templates.items[foregripId]._props.Recoil = foregripSettings.Recoil;            
        }
        for (const bulletId in this.modConfig.Bullets) 
        {
            const bulletSettings = this.modConfig.Bullets[bulletId];

            tables.templates.items[bulletId]._props.PenetrationPower = bulletSettings.Penetration;
            tables.templates.items[bulletId]._props.Damage = bulletSettings.Damage;
            tables.templates.items[bulletId]._props.ammoAccr = bulletSettings.ammoAccr;
            tables.templates.items[bulletId]._props.ammoRec = bulletSettings.ammoRec;
            tables.templates.items[bulletId]._props.ArmorDamage = bulletSettings.ArmorDamage;
            tables.templates.items[bulletId]._props.HeatFactor = bulletSettings.HeatFactor;
            tables.templates.items[bulletId]._props.DurabilityBurnModificator = bulletSettings.DurabilityBurnModificator;
        }
        for (const suppressorId in this.modConfig.Suppressors) 
        {
            const suppressorSettings = this.modConfig.Suppressors[suppressorId];
    
            tables.templates.items[suppressorId]._props.Ergonomics = suppressorSettings.Ergonomics;
            tables.templates.items[suppressorId]._props.Recoil = suppressorSettings.Recoil;
            tables.templates.items[suppressorId]._props.Accuracy = suppressorSettings.Accuracy;
            tables.templates.items[suppressorId]._props.Loudness = suppressorSettings.Loudness;
            tables.templates.items[suppressorId]._props.Velocity = suppressorSettings.Velocity;
            tables.templates.items[suppressorId]._props.HeatFactor = suppressorSettings.HeatFactor;
            tables.templates.items[suppressorId]._props.DurabilityBurnModificator = suppressorSettings.DurabilityBurnModificator;
            tables.templates.items[suppressorId]._props.CoolFactor = suppressorSettings.CoolFactor;
        }
        for (const stocksId in this.modConfig.Stocks) 
        {
            const stockSettings = this.modConfig.Stocks[stocksId];
    
            tables.templates.items[stocksId]._props.Ergonomics = stockSettings.Ergonomics;
            tables.templates.items[stocksId]._props.Recoil = stockSettings.Recoil;            
        }
        for (const armoredmaskId in this.modConfig.ArmoredMasks) 
        {
            const armoredmasksSettings = this.modConfig.ArmoredMasks[armoredmaskId];
        
            tables.templates.items[armoredmaskId]._props.armorClass = armoredmasksSettings.armorClass;
            tables.templates.items[armoredmaskId]._props.Durability = armoredmasksSettings.Durability;   
            tables.templates.items[armoredmaskId]._props.MaxDurability = armoredmasksSettings.MaxDurability;       
            tables.templates.items[armoredmaskId]._props.BlocksHeadwear = armoredmasksSettings.BlocksHeadwear;        
            tables.templates.items[armoredmaskId]._props.armorColliders = armoredmasksSettings.armorColliders;  
            
            if (armoredmasksSettings?.price !== undefined) 
            {
                tables.templates.handbook[armoredmaskId].HandbookItem.Price = armoredmasksSettings.price;
            }   
        }
        

    }
}

export const mod = new Mod();
