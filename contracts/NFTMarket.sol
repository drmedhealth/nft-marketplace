// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarket is ERC721URIStorage, Ownable {
    uint256 public tokenCount;
    uint256 public listingCount;
    uint256 public royaltyFee = 250;
    address public royaltyRecipient;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        royaltyRecipient = msg.sender;
    }

    function setRoyaltyRecipient(address _recipient) public onlyOwner {
        royaltyRecipient = _recipient;
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        tokenCount += 1;
        uint256 newTokenId = tokenCount;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }

    function listToken(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be > 0");

        listings[tokenId] = Listing(tokenId, msg.sender, price, true);
        listingCount++;
    }

    function buyToken(uint256 tokenId) public payable {
        Listing memory item = listings[tokenId];
        require(item.active, "Not listed");
        require(msg.value >= item.price, "Insufficient payment");

        uint256 royaltyAmount = (msg.value * royaltyFee) / 10000;
        uint256 sellerAmount = msg.value - royaltyAmount;

        address seller = item.seller;
        _transfer(seller, msg.sender, tokenId);

        payable(seller).transfer(sellerAmount);
        payable(royaltyRecipient).transfer(royaltyAmount);
        listings[tokenId].active = false;
    }

    function getListing(uint256 tokenId) public view returns (Listing memory) {
        return listings[tokenId];
    }
}
