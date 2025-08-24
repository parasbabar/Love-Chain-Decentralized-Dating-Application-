module InstaMatch::profile_nft {
    use std::signer;
    use std::string::{String};
    use aptos_token::token;
    use aptos_framework::account;
    use aptos_framework::event;

    struct ProfileNFT has key, store {
        username: String,
        bio: String,
        age: u8,
        gender: String,
        interests: vector<String>,
        verified: bool,
        green_flags: u64,
        red_flags: u64,
        token_data_id: token::TokenDataId,
    }

    struct MintProfileNFTEvent has drop, store {
        minter: address,
        username: String,
        token_name: String,
    }

    public fun initialize_module(account: &signer) {
        let account_addr = signer::address_of(account);
        event::publish_generator(account, account_addr);
    }

    public entry fun mint_profile_nft(
        account: &signer,
        username: String,
        bio: String,
        age: u8,
        gender: String,
        interests: vector<String>,
    ) acquires ProfileNFT {
        let account_addr = signer::address_of(account);
        
        // Check if user already has a profile NFT
        assert!(!exists<ProfileNFT>(account_addr), 1001);
        
        // Create token collection if it doesn't exist
        if (!token::collection_exists(account_addr, "InstaMatch Profiles")) {
            token::create_collection(
                account,
                "InstaMatch Profiles",
                "Verifiable dating profiles on InstaMatch",
                "https://instamatch.com/nfts/",
            );
        }
        
        // Create token data
        let token_data_id = token::create_tokendata(
            account,
            "InstaMatch Profiles",
            username,
            "InstaMatch Profile NFT",
            1, // maximum
            "https://instamatch.com/nfts/profile.json",
            account_addr,
            0, // royalty points per million
            0, // token mutability config
            vector<bool>[ true, true, true, true, true ], // property keys
            vector<vector<u8>>[
                bcs::to_bytes(&username),
                bcs::to_bytes(&bio),
                bcs::to_bytes(&age),
                bcs::to_bytes(&gender),
                bcs::to_bytes(&interests)
            ], // property values
            vector<String>["string", "string", "number", "string", "string"], // property types
        );
        
        // Mint the NFT
        token::mint_token(
            account,
            token_data_id,
            1, // amount
        );
        
        // Store profile data
        move_to(account, ProfileNFT {
            username,
            bio,
            age,
            gender,
            interests,
            verified: false,
            green_flags: 0,
            red_flags: 0,
            token_data_id,
        });
        
        // Emit event
        let generator_addr = account_addr;
        event::emit_event<MintProfileNFTEvent>(
            &mut event::event_generator(generator_addr),
            MintProfileNFTEvent {
                minter: account_addr,
                username: copy username,
                token_name: copy username,
            },
        );
    }

    public fun get_profile(account: address): ProfileNFT acquires ProfileNFT {
        assert!(exists<ProfileNFT>(account), 1001);
        *borrow_global<ProfileNFT>(account)
    }

    public entry fun add_green_flag(account: &signer, target: address) acquires ProfileNFT {
        assert!(exists<ProfileNFT>(target), 1001);
        let profile = borrow_global_mut<ProfileNFT>(target);
        profile.green_flags = profile.green_flags + 1;
    }

    public entry fun add_red_flag(account: &signer, target: address) acquires ProfileNFT {
        assert!(exists<ProfileNFT>(target), 1001);
        let profile = borrow_global_mut<ProfileNFT>(target);
        profile.red_flags = profile.red_flags + 1;
    }

    public entry fun verify_profile(admin: &signer, target: address) acquires ProfileNFT {
        // In a real implementation, you would check if the signer is an admin
        assert!(exists<ProfileNFT>(target), 1001);
        let profile = borrow_global_mut<ProfileNFT>(target);
        profile.verified = true;
    }
}